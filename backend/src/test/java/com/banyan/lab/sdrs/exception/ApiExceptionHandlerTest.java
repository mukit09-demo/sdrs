package com.banyan.lab.sdrs.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.entity.NewsType;
import java.lang.reflect.Method;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;
import org.hibernate.exception.ConstraintViolationException;
import org.hibernate.exception.ConstraintViolationException.ConstraintKind;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponseException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Each handler called directly: the status, the message the caller sees, and
 * the path. The controller tests cover the wiring; this covers the branches.
 */
class ApiExceptionHandlerTest {

    private static final String PATH = "/api/articles/kai-tak";

    private final ApiExceptionHandler handler = new ApiExceptionHandler();

    private static MockHttpServletRequest request() {
        return new MockHttpServletRequest("PUT", PATH);
    }

    /** Somewhere for a {@link MethodParameter} to point. */
    @SuppressWarnings("unused")
    private void endpoint(String body) {}

    private static MethodParameter parameter() throws NoSuchMethodException {
        Method method = ApiExceptionHandlerTest.class.getDeclaredMethod("endpoint", String.class);
        return new MethodParameter(method, 0);
    }

    /**
     * Asserts the common shape and returns the body, checked non-null, so a test
     * reads further fields from it rather than calling the nullable
     * {@code getBody()} again.
     */
    private static ApiError assertError(ResponseEntity<ApiError> response, HttpStatus status, String message) {
        assertThat(response.getStatusCode()).isEqualTo(status);
        ApiError body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.status()).isEqualTo(status.value());
        assertThat(body.error()).isEqualTo(status.getReasonPhrase());
        assertThat(body.message()).isNotNull().isEqualTo(message);
        assertThat(body.path()).isEqualTo(PATH);
        assertThat(body.timestamp()).isNotNull();
        assertThat(body.fieldErrors()).isNotNull();
        return body;
    }

    @Test
    @DisplayName("not found is a 404 carrying the exception's message")
    void testIfMissingResourceReturnsNotFound() {
        ResponseEntity<ApiError> response =
                handler.notFound(new ResourceNotFoundException("article", "kai-tak"), request());

        ApiError body = assertError(response, HttpStatus.NOT_FOUND, "No article with id \"kai-tak\"");
        assertThat(body.fieldErrors()).isEmpty();
    }

    @Test
    @DisplayName("a duplicate is a 409 carrying the exception's message")
    void testIfDuplicateResourceReturnsConflict() {
        ResponseEntity<ApiError> response =
                handler.duplicate(new DuplicateResourceException("market", "buildings"), request());

        assertError(response, HttpStatus.CONFLICT, "A market with id \"buildings\" already exists");
    }

    @Test
    @DisplayName("a validation failure is a 400 with one message per field, the first one winning")
    void testIfInvalidBodyReturnsBadRequestWithFirstErrorPerField() throws Exception {
        BeanPropertyBindingResult result = new BeanPropertyBindingResult(new Object(), "request");
        result.addError(new FieldError("request", "slug", "must not be blank"));
        result.addError(new FieldError("request", "slug", "size must be between 0 and 160"));
        result.addError(new FieldError("request", "title", "must not be blank"));

        ResponseEntity<ApiError> response =
                handler.invalidBody(new MethodArgumentNotValidException(parameter(), result), request());

        ApiError body = assertError(response, HttpStatus.BAD_REQUEST, "Request body failed validation");
        assertThat(body.fieldErrors())
                .containsExactly(
                        Map.entry("slug", "must not be blank"),
                        Map.entry("title", "must not be blank"));
    }

    @Test
    @DisplayName("a validation failure with only object-level errors has no field errors")
    void testIfInvalidBodyWithOnlyObjectErrorsHasNoFieldErrors() throws Exception {
        BeanPropertyBindingResult result = new BeanPropertyBindingResult(new Object(), "request");
        result.reject("invalid", "whole object is wrong");

        ResponseEntity<ApiError> response =
                handler.invalidBody(new MethodArgumentNotValidException(parameter(), result), request());

        ApiError body = assertError(response, HttpStatus.BAD_REQUEST, "Request body failed validation");
        assertThat(body.fieldErrors()).isEmpty();
    }

    @Test
    @DisplayName("an unknown enum label surfaces the root cause, naming the valid labels")
    void testIfUnknownEnumLabelReturnsBadRequestNamingValidLabels() {
        IllegalArgumentException root = assertThrowsFromLabel();
        RuntimeException wrapped = new RuntimeException("binding failed", root);
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "JSON parse error", wrapped, new MockHttpInputMessage(new byte[0]));

        ResponseEntity<ApiError> response = handler.unreadable(ex, request());

        ApiError body = assertError(response, HttpStatus.BAD_REQUEST, root.getMessage());
        assertThat(body.message()).contains("Press release");
    }

    @Test
    @DisplayName("malformed JSON says so, without echoing the parser's internals")
    void testIfMalformedJsonReturnsBadRequestWithoutParserDetails() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "JSON parse error", new IllegalStateException("Unexpected character '}' at offset 17"),
                new MockHttpInputMessage(new byte[0]));

        assertError(handler.unreadable(ex, request()), HttpStatus.BAD_REQUEST, "Malformed request body");
    }

    @Test
    @DisplayName("an unreadable body with no cause at all is still a plain 400")
    void testIfUnreadableBodyWithoutCauseReturnsBadRequest() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "Required request body is missing", new MockHttpInputMessage(new byte[0]));

        assertError(handler.unreadable(ex, request()), HttpStatus.BAD_REQUEST, "Malformed request body");
    }

    @Test
    @DisplayName("a path or query value that does not convert is a 400, not a 500")
    void testIfUnconvertibleParameterReturnsBadRequest() throws Exception {
        MethodArgumentTypeMismatchException ex = new MethodArgumentTypeMismatchException(
                "abc", Long.class, "id", parameter(), new NumberFormatException("abc"));

        assertError(handler.invalidParameter(ex, request()), HttpStatus.BAD_REQUEST, "Invalid request parameter");
    }

    @Test
    @DisplayName("an illegal argument from a service is a 400 carrying its message")
    void testIfIllegalArgumentReturnsBadRequestWithItsMessage() {
        assertError(
                handler.illegalArgument(new IllegalArgumentException("No market with slug atlantis"), request()),
                HttpStatus.BAD_REQUEST,
                "No market with slug atlantis");
    }

    @Test
    @DisplayName("anything else is a flat 500 that does not leak the internal message")
    void testIfUnexpectedErrorReturns500WithoutLeakingDetails() {
        ResponseEntity<ApiError> response = handler.unexpected(
                new IllegalStateException("connection to db-primary:5432 refused"), request());

        ApiError body = assertError(response, HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
        assertThat(body.message()).doesNotContain("db-primary");
    }

    @Test
    @DisplayName("an unknown path keeps Spring's 404 instead of becoming a 500")
    void testIfUnknownPathReturnsNotFound() {
        NoResourceFoundException ex = new NoResourceFoundException(HttpMethod.GET, PATH, "api/articles/kai-tak");

        ApiError body = assertError(
                handler.unexpected(ex, request()), HttpStatus.NOT_FOUND, ex.getBody().getDetail());
        assertThat(body.message()).isNotBlank();
    }

    @Test
    @DisplayName("an unsupported method is a 405 that carries the Allow header")
    void testIfUnsupportedMethodReturnsMethodNotAllowedWithAllowHeader() {
        HttpRequestMethodNotSupportedException ex =
                new HttpRequestMethodNotSupportedException("PATCH", List.of("GET", "PUT", "DELETE"));

        ResponseEntity<ApiError> response = handler.unexpected(ex, request());

        assertError(response, HttpStatus.METHOD_NOT_ALLOWED, ex.getBody().getDetail());
        assertThat(response.getHeaders().getFirst(HttpHeaders.ALLOW)).contains("GET", "PUT", "DELETE");
    }

    @Test
    @DisplayName("an unsupported content type is a 415, not a 500")
    void testIfUnsupportedMediaTypeReturns415() {
        HttpMediaTypeNotSupportedException ex = new HttpMediaTypeNotSupportedException(
                MediaType.TEXT_PLAIN, List.of(MediaType.APPLICATION_JSON));

        ResponseEntity<ApiError> response = handler.unexpected(ex, request());

        assertError(response, HttpStatus.UNSUPPORTED_MEDIA_TYPE, ex.getBody().getDetail());
        assertThat(response.getHeaders().getAccept()).contains(MediaType.APPLICATION_JSON);
    }

    @Test
    @DisplayName("a missing required parameter is a 400, not a 500")
    void testIfMissingParameterReturnsBadRequest() {
        MissingServletRequestParameterException ex = new MissingServletRequestParameterException("limit", "int");

        assertError(handler.unexpected(ex, request()), HttpStatus.BAD_REQUEST, ex.getBody().getDetail());
    }

    @Test
    @DisplayName("a Spring error response with no detail falls back to the reason phrase")
    void testIfSpringErrorWithoutDetailUsesReasonPhrase() {
        ErrorResponseException ex = new ErrorResponseException(HttpStatus.NOT_ACCEPTABLE);
        ex.getBody().setDetail(null);

        assertError(handler.unexpected(ex, request()), HttpStatus.NOT_ACCEPTABLE, "Not Acceptable");
    }

    @Test
    @DisplayName("a Spring error response that is itself a 5xx stays a generic 500")
    void testIfSpringServerErrorStaysGeneric() {
        ErrorResponseException ex = new ErrorResponseException(HttpStatus.SERVICE_UNAVAILABLE);
        ex.getBody().setDetail("pool exhausted on db-primary");

        ApiError body = assertError(
                handler.unexpected(ex, request()), HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong");
        assertThat(body.message()).doesNotContain("db-primary");
    }

    /** What Spring's JPA dialect hands back when Postgres refuses the commit. */
    private static DataIntegrityViolationException integrity(ConstraintKind kind, String constraint) {
        SQLException sql = new SQLException("ERROR: violates constraint \"" + constraint + "\" Detail: Key (slug)=(buildings)");
        return new DataIntegrityViolationException(
                "could not execute statement",
                new ConstraintViolationException("could not execute statement", sql, "insert into market ...", kind, constraint));
    }

    @Test
    @DisplayName("a unique-constraint race is a 409 naming the collection and column, not the SQL")
    void testIfUniqueViolationReturnsConflictWithoutSql() {
        ResponseEntity<ApiError> response =
                handler.integrityViolation(integrity(ConstraintKind.UNIQUE, "uk_market_slug"), request());

        ApiError body = assertError(response, HttpStatus.CONFLICT, "Another market already uses that slug");
        assertThat(body.message()).doesNotContain("insert", "buildings");
    }

    @Test
    @DisplayName("a multi-word table reads as words")
    void testIfMultiWordTableReadsNaturally() {
        assertError(
                handler.integrityViolation(integrity(ConstraintKind.UNIQUE, "uk_news_article_slug"), request()),
                HttpStatus.CONFLICT,
                "Another news article already uses that slug");
    }

    @Test
    @DisplayName("a unique constraint off the naming convention gets the generic wording")
    void testIfUnconventionalConstraintGetsGenericMessage() {
        assertThat(ApiExceptionHandler.uniqueMessage("market_pkey")).isEqualTo("That conflicts with an existing record");
        assertThat(ApiExceptionHandler.uniqueMessage("uk_slug")).isEqualTo("That conflicts with an existing record");
        assertThat(ApiExceptionHandler.uniqueMessage(null)).isEqualTo("That conflicts with an existing record");
    }

    @Test
    @DisplayName("a DuplicateKeyException with no Hibernate cause is still a 409")
    void testIfBareDuplicateKeyReturnsConflict() {
        assertError(
                handler.integrityViolation(new DuplicateKeyException("duplicate key"), request()),
                HttpStatus.CONFLICT,
                "That conflicts with an existing record");
    }

    @Test
    @DisplayName("a foreign-key race is a 409")
    void testIfForeignKeyViolationReturnsConflict() {
        assertError(
                handler.integrityViolation(integrity(ConstraintKind.FOREIGN_KEY, "fk_project_market_market"), request()),
                HttpStatus.CONFLICT,
                "It refers to something that no longer exists");
    }

    @Test
    @DisplayName("a not-null or check violation is a validation gap, so it stays a generic 500")
    void testIfNotNullViolationStaysServerError() {
        assertError(
                handler.integrityViolation(integrity(ConstraintKind.NOT_NULL, "market_name_nn"), request()),
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong");
        assertError(
                handler.integrityViolation(new DataIntegrityViolationException("no cause"), request()),
                HttpStatus.INTERNAL_SERVER_ERROR,
                "Something went wrong");
    }

    @Test
    @DisplayName("a self-referencing cause chain does not loop")
    void testIfSelfReferencingCauseDoesNotLoop() {
        HttpMessageNotReadableException ex = new HttpMessageNotReadableException(
                "loop", new SelfCaused(), new MockHttpInputMessage(new byte[0]));

        assertError(handler.unreadable(ex, request()), HttpStatus.BAD_REQUEST, "Malformed request body");
    }

    /** {@code getCause()} returns itself, which {@code rootCause} must stop at. */
    private static final class SelfCaused extends RuntimeException {
        @Override
        public synchronized Throwable getCause() {
            return this;
        }
    }

    private static IllegalArgumentException assertThrowsFromLabel() {
        try {
            NewsType.fromLabel("Blog");
        } catch (IllegalArgumentException ex) {
            return ex;
        }
        throw new AssertionError("fromLabel accepted an unknown label");
    }
}
