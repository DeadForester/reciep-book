package dev.recipeservice.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import dev.recipeservice.entity.Difficulty;
import dev.recipeservice.service.recipe.RecipeService;
import dev.recipeservice.web.controller.RecipeController;
import dev.recipeservice.web.dto.RecipeRequest;
import dev.recipeservice.web.dto.RecipeResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(RecipeController.class)
class RecipeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private RecipeService service;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void shouldReturnRecipes() throws Exception {

        RecipeResponse response = new RecipeResponse(
                "1",
                "Pizza",
                "Italian pizza",
                List.of("Flour"),
                List.of("Bake"),
                30,
                Difficulty.MEDIUM,
                null,
                Instant.now()
        );

        Page<RecipeResponse> page =
                new PageImpl<>(List.of(response), PageRequest.of(0, 10), 1);

        when(service.findAll(any())).thenReturn(page);

        mockMvc.perform(get("/api/v1/recipes")
                        .param("page", "0")
                        .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content.length()").value(1))
                .andExpect(jsonPath("$.content[0].title").value("Pizza"));
    }

    @Test
    void shouldCreateRecipe() throws Exception {

        RecipeRequest request = new RecipeRequest(
                "Burger",
                "Tasty burger",
                List.of("Meat"),
                List.of("Cook"),
                20,
                Difficulty.EASY
        );

        RecipeResponse response = new RecipeResponse(
                "1",
                "Burger",
                "Tasty burger",
                List.of("Meat"),
                List.of("Cook"),
                20,
                Difficulty.EASY,
                null,
                Instant.now()
        );

        when(service.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/recipes")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Burger"));
    }
}