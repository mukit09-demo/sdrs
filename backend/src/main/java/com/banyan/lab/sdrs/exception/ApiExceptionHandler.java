package com.banyan.lab.sdrs.exception;

import jakarta.servlet.http.HttpServletRequest;
import java.util.LinkedHashMap;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.HandlerMethodValidationException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;

@RestControllerAdvice
public class ApiExceptionHandler {

    private static final org.slf4j.Logger log =
            org.slf4j.LoggerFactory.getLogger(ApiExceptionHandler.class);

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> notFound(ResourceNotFoundException ex, HttpServletRequest request) {
        return respond(HttpStatus.NOT_FOUND, ex.getMessage(), ex, request);
    }

    @ExceptionHandler(DuplicateResourceException.class)
    public ResponseEntity<ApiError> duplicate(DuplicateResourceException ex, HttpServletRequest request) {
        return respond(HttpStatus.CONFLICT, ex.getMessage(), ex, request);
    }

    /** Bean-validation failures on a {@code @Valid} request body. */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> invalidBody(
            MethodArgumentNotValidException ex, HttpServletRequest request) {

        Map<String, String> fields = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            fields.putIfAbsent(error.getField(), error.getDefaultMessage());
        }

        return respond(HttpStatus.BAD_REQUEST, "Request body failed validation", fields, ex, request);
    }

    /**
     * Malformed JSON, or a value Jackson could not convert — which includes an
     * unrecognised news category, since {@code NewsType.fromLabel} throws. The
     * root cause's message is surfaced so the response names the five valid
     * labels instead of just saying the body was unreadable.
     */
    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiError> unreadable(
            HttpMessageNotReadableException ex, HttpServletRequest request) {

        Throwable cause = rootCause(ex);
        String detail = cause instanceof IllegalArgumentException ? cause.getMessage() : "Malformed request body";

        return respond(HttpStatus.BAD_REQUEST, detail, ex, request);
    }

    /**
     * A path or query value that does not convert or fails a constraint — a job
     * id of {@code abc}, a {@code limit} of {@code 0}. Without this they fall
     * through to the 500 below.
     */
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
        return respond(HttpStatus.INTERNAL_SERVER_ERROR, "Something went wrong", ex, request);
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

        log(status, ex, request);
        return ResponseEntity.status(status)
                .body(ApiError.of(
                        status.value(), status.getReasonPhrase(), message, request.getRequestURI(), fieldErrors));
    }

    private static void log(HttpStatus status, Exception ex, HttpServletRequest request) {
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
}
