package dev.recipeservice.repository;

import dev.recipeservice.entity.Recipe;
import dev.recipeservice.repository.recipe.RecipeRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.data.mongo.DataMongoTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.MongoDBContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import static org.assertj.core.api.AssertionsForClassTypes.assertThat;

@DataMongoTest
@Testcontainers
class RecipeRepositoryTest {

    @Container
    static MongoDBContainer mongoDBContainer = new MongoDBContainer("mongo:latest");

    @DynamicPropertySource
    static void setProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.data.mongodb.uri", mongoDBContainer::getReplicaSetUrl);
    }

    @Autowired
    private RecipeRepository repository;

    @Test
    void shouldSaveRecipe() {
        Recipe recipe = new Recipe();
        recipe.setTitle("Pasta");

        Recipe saved = repository.save(recipe);

        assertThat(saved.getId()).isNotNull();
    }
}