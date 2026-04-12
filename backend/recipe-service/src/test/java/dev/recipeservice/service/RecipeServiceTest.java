package dev.recipeservice.service;

import dev.recipeservice.entity.Difficulty;
import dev.recipeservice.entity.Recipe;
import dev.recipeservice.exception.NotFoundException;
import dev.recipeservice.repository.recipe.RecipeRepository;
import dev.recipeservice.service.image.ImageService;
import dev.recipeservice.service.recipe.RecipeService;
import dev.recipeservice.web.dto.RecipeRequest;
import dev.recipeservice.web.dto.RecipeResponse;
import dev.recipeservice.web.mapper.RecipeMapper;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RecipeServiceTest {

    @Mock
    private RecipeRepository repository;

    @Mock
    private ImageService imageService;

    @Mock
    private RecipeMapper mapper;

    @InjectMocks
    private RecipeService service;

    @Test
    void shouldCreateRecipe() {

        RecipeRequest request = new RecipeRequest(
                "Pizza",
                "Italian pizza",
                List.of("Flour"),
                null,
                null,
                null
        );

        Recipe entity = new Recipe();
        entity.setTitle("Pizza");

        RecipeResponse response = new RecipeResponse(
                "1",
                "Pizza",
                "Italian pizza",
                List.of("Flour"),
                null,
                null,
                null,
                null,
                null
        );

        when(mapper.toEntity(request)).thenReturn(entity);
        when(repository.save(entity)).thenReturn(entity);
        when(mapper.toDto(entity)).thenReturn(response);

        RecipeResponse result = service.create(request);

        assertThat(result.title()).isEqualTo("Pizza");
        verify(repository).save(entity);
    }

    @Test
    void shouldReturnAllRecipes() {

        PageRequest pageable = PageRequest.of(0, 10);

        Recipe recipe = new Recipe();
        Page<Recipe> page = new PageImpl<>(List.of(recipe));

        when(repository.findAll(pageable)).thenReturn(page);
        when(mapper.toDto(any())).thenReturn(
                new RecipeResponse("1","Test",null,List.of("ing"),null,null,null,null,null)
        );

        Page<RecipeResponse> result = service.findAll(pageable);

        assertThat(result.getContent()).hasSize(1);
    }

    @Test
    void shouldDeleteRecipe() {

        Recipe recipe = new Recipe();
        recipe.setId("123");

        when(repository.findById("123"))
                .thenReturn(Optional.of(recipe));

        service.deleteById("123");

        verify(repository).delete(recipe);
    }

    @Test
    void shouldThrowIfDeleteNotFound() {

        when(repository.findById("999"))
                .thenReturn(Optional.empty());

        assertThatThrownBy(() -> service.deleteById("999"))
                .isInstanceOf(NotFoundException.class);
    }

    @Test
    void shouldUploadImage() throws Exception {
        MultipartFile file = mock(MultipartFile.class);

        Recipe recipe = new Recipe();
        recipe.setId("1");

        Recipe savedRecipe = new Recipe();
        savedRecipe.setId("1");
        savedRecipe.setImageUrl("http://minio/test.jpg");

        RecipeResponse response = new RecipeResponse(
                "1",
                "Pizza",
                null,
                null,
                null,
                null,
                null,
                "http://minio/test.jpg",
                null
        );

        when(repository.findById("1"))
                .thenReturn(Optional.of(recipe));

        when(imageService.uploadFile(file))
                .thenReturn("http://minio/test.jpg");

        when(repository.save(recipe))
                .thenReturn(savedRecipe);

        when(mapper.toDto(savedRecipe))
                .thenReturn(response);

        RecipeResponse result = service.uploadImage("1", file);

        assertThat(result.imageUrl())
                .isEqualTo("http://minio/test.jpg");

        verify(repository).save(recipe);
    }
}