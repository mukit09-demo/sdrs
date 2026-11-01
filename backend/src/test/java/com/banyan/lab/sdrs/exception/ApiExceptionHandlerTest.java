package com.banyan.lab.sdrs.exception;

import static org.assertj.core.api.Assertions.assertThat;

import com.banyan.lab.sdrs.entity.NewsType;
import java.lang.reflect.Method;
import java.util.Map;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.mock.http.MockHttpInputMessage;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

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
