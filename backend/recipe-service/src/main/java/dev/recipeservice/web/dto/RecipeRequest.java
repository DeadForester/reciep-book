package dev.recipeservice.web.dto;

import dev.recipeservice.entity.Difficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record RecipeRequest(
        @NotBlank String title,
        String description,
        @NotEmpty List<String> ingredients,
        List<String> steps,
        Integer cookingTimeMinutes,
        Difficulty difficulty
) {}
