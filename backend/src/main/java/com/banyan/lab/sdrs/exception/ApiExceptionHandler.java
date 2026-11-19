package com.banyan.lab.sdrs.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.exception.ConstraintViolationException;
import org.hibernate.exception.ConstraintViolationException.ConstraintKind;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.ErrorResponse;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@Slf4j
@RestControllerAdvice
public class ApiExceptionHandler {

    private static final List<String> UNIQUE_COLUMNS = List.of("slug", "reference");

    private static final String UNIQUE_PREFIX = "uk_";

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> notFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return respond(HttpStatus.NOT_FOUND, ex.getMessage(), ex, request);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> duplicate(DuplicateResourceException ex, HttpServletRequest request) {
        return respond(HttpStatus.CONFLICT, ex.getMessage(), ex, request);
    }

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ApiError> integrityViolation(
            DataIntegrityViolationException ex, HttpServletRequest request) {

        ConstraintViolationException violation = find(ex, ConstraintViolationException.class);
        ConstraintKind kind = violation != null
                ? violation.getKind()
                : ex instanceof DuplicateKeyException ? ConstraintKind.UNIQUE : ConstraintKind.OTHER;
        String constraint = violation != null ? violation.getConstraintName() : null;

        return switch (kind) {
            case UNIQUE -> respond(HttpStatus.CONFLICT, uniqueMessage(constraint), ex, request);
            case FOREIGN_KEY -> respond(
                    HttpStatus.CONFLICT, "It refers to something that no longer exists", ex, request);
            default -> unexpected(ex, request);
        };
    }

    static String uniqueMessage(String constraint) {
        if (constraint != null) {
            String name = constraint.toLowerCase(Locale.ROOT);
            for (String column : UNIQUE_COLUMNS) {
                String suffix = "_" + column;
                if (name.startsWith(UNIQUE_PREFIX)
                        && name.endsWith(suffix)
                        && name.length() > UNIQUE_PREFIX.length() + suffix.length()) {
                    String table = name.substring(UNIQUE_PREFIX.length(), name.length() - suffix.length())
                            .replace('_', ' ');
                    return "Another %s already uses that %s".formatted(table, column);
                }
            }
        }
        return "That conflicts with an existing record";
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> invalidBody(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(error.getField(), error.getDefaultMessage());
        }

        return respond(HttpStatus.BAD_REQUEST, "Request body failed validation", fields, ex, request);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> unreadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        Throwable cause = rootCause(ex);
        String detail = cause instanceof IllegalArgumentException ? cause.getMessage() : "Malformed request body";

        return respond(HttpStatus.BAD_REQUEST, detail, ex, request);
    }

    @ExceptionHandler({MethodArgumentTypeMismatchException.class, HandlerMethodValidationException.class})
    public ResponseEntity<ApiError> invalidParameter(Exception ex, HttpServletRequest request) {
        return respond(HttpStatus.BAD_REQUEST, "Invalid request parameter", ex, request);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiError> illegalArgument(
            IllegalArgumentException ex, HttpServletRequest request) {
        return respond(HttpStatus.BAD_REQUEST, ex.getMessage(), ex, request);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> unexpected(Exception ex, HttpServletRequest request) {
        if (ex instanceof ErrorResponse exception) {
            HttpStatus status = HttpStatus.resolve(exception.getStatusCode().value());
            if (status != null && !status.is5xxServerError()) {
                return respond(status, clientMessage(exception, status), Map.of(), exception.getHeaders(), ex, request);
            }
        }
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", ex, request);
    }

    private static String clientMessage(ErrorResponse spring, HttpStatus status) {
        String detail = spring.getBody().getDetail();
        return detail == null || detail.isBlank() ? status.getReasonPhrase() : detail;
    }

    private static ResponseEntity<ApiError> respond(
            HttpStatus status, String message, Exception ex, HttpServletRequest request) {
        return respond(status, message, Map.of(), ex, request);
    }

    private static ResponseEntity<ApiError> respond(
            HttpStatus status,
            String message,
            Map<String, String> fieldErrors,
            Exception ex,
            HttpServletRequest request) {
        return respond(status, message, fieldErrors, HttpHeaders.EMPTY, ex, request);
    }

    private static ResponseEntity<ApiError> respond(
            HttpStatus status,
            String message,
            Map<String, String> fieldErrors,
            HttpHeaders headers,
            Exception ex,
            HttpServletRequest request) {

        logFailure(status, ex, request);
        return ResponseEntity.status(status)
                .headers(headers)
                .body(ApiError.of(
                        status.value(), status.getReasonPhrase(), message, request.getRequestURI(), fieldErrors));
    }

    private static void logFailure(HttpStatus status, Exception ex, HttpServletRequest request) {
        if (status.is5xxServerError()) {
            log.error("Unhandled failure on {} {}", request.getMethod(), request.getRequestURI(), ex);
        } else {
            log.warn("{} on {} {}: {}",
                    status.value(), request.getMethod(), request.getRequestURI(), ex.getMessage());
        }
    }

    private static Throwable rootCause(Throwable throwable) {
        Throwable current = throwable;
        while (current.getCause() != null && current.getCause() != current) {
            current = current.getCause();
        }
        return current;
    }

    private static <T extends Throwable> T find(Throwable throwable, Class<T> type) {
        Throwable current = throwable;
        while (current != null) {
            if (type.isInstance(current)) {
                return type.cast(current);
            }
            Throwable cause = current.getCause();
            current = cause == current ? null : cause;
        }
        return null;
    }
}
