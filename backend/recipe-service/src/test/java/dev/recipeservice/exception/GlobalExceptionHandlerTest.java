package dev.recipeservice.exception;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    void handleValidation_ShouldReturnBadRequest_WithFieldErrors() {
        // Given
        MethodArgumentNotValidException ex = mock(MethodArgumentNotValidException.class);
        BindingResult bindingResult = mock(BindingResult.class);

        FieldError fieldError1 = new FieldError("object", "title", "Title is required");
        FieldError fieldError2 = new FieldError("object", "description", "Description must be at least 10 characters");

        when(ex.getBindingResult()).thenReturn(bindingResult);
        when(bindingResult.getFieldErrors()).thenReturn(List.of(fieldError1, fieldError2));

        // When
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleValidation(ex);

        // Then
        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(2, response.getBody().size());
        assertEquals("Title is required", response.getBody().get("title"));
        assertEquals("Description must be at least 10 characters", response.getBody().get("description"));
    }

    @Test
    void handleNotFound_ShouldReturnNotFoundStatus_WithMessage() {
        // Given
        NotFoundException ex = new NotFoundException("Recipe not found");

        // When
        ResponseEntity<String> response = exceptionHandler.handleNotFound(ex);

        // Then
        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Recipe not found", response.getBody());
    }
}