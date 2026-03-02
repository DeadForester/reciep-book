package dev.recipeservice.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;


@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "recipes")
public class Recipe {
    @Id
    private String id;
    private String title;
    private String description;
    private List<String> ingredients;
    private List<String> steps;
    private Integer cookingTimeMinutes;
    private Difficulty difficulty;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}