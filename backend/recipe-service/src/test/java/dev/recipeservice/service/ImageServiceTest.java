package dev.recipeservice.service;

import dev.recipeservice.service.image.ImageService;
import io.minio.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ImageServiceTest {

    @Mock
    private MinioClient minioClient;

    @InjectMocks
    private ImageService imageService;

    private static final String BUCKET = "test-bucket";
    private static final String IMAGE_PROXY_PATH = "/images/";

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(imageService, "bucket", BUCKET);
        ReflectionTestUtils.setField(imageService, "imageProxyPath", IMAGE_PROXY_PATH);
    }

    @Test
    void uploadFile_ShouldCreateBucketIfNotExists_AndUploadFile() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test image content".getBytes()
        );

        when(minioClient.bucketExists(any(BucketExistsArgs.class)))
                .thenReturn(false);
        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(null);

        // When
        String result = imageService.uploadFile(file);

        // Then
        assertNotNull(result);
        assertTrue(result.startsWith(IMAGE_PROXY_PATH));
        assertTrue(result.contains("test.jpg"));

        verify(minioClient, times(1)).bucketExists(any(BucketExistsArgs.class));
        verify(minioClient, times(1)).makeBucket(any(MakeBucketArgs.class));
        verify(minioClient, times(1)).putObject(any(PutObjectArgs.class));
    }

    @Test
    void uploadFile_ShouldNotCreateBucketIfExists() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.png",
                "image/png",
                "test content".getBytes()
        );

        when(minioClient.bucketExists(any(BucketExistsArgs.class)))
                .thenReturn(true);
        when(minioClient.putObject(any(PutObjectArgs.class)))
                .thenReturn(null);

        // When
        String result = imageService.uploadFile(file);

        // Then
        assertNotNull(result);
        assertTrue(result.startsWith(IMAGE_PROXY_PATH));

        verify(minioClient, times(1)).bucketExists(any(BucketExistsArgs.class));
        verify(minioClient, never()).makeBucket(any(MakeBucketArgs.class));
        verify(minioClient, times(1)).putObject(any(PutObjectArgs.class));
    }

    @Test
    void uploadFile_ShouldThrowRuntimeException_WhenMinioFails() throws Exception {
        // Given
        MockMultipartFile file = new MockMultipartFile(
                "file",
                "test.jpg",
                "image/jpeg",
                "test content".getBytes()
        );

        when(minioClient.bucketExists(any(BucketExistsArgs.class)))
                .thenThrow(new RuntimeException("MinIO error"));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            imageService.uploadFile(file);
        });

        assertEquals("Error uploading file to MinIO", exception.getMessage());
        verify(minioClient, times(1)).bucketExists(any(BucketExistsArgs.class));
    }

    @Test
    void deleteFile_ShouldDeleteObject_WhenUrlContainsImagesPath() throws Exception {
        // Given
        String fileUrl = "/images/uuid_test-image.jpg";

        // When
        imageService.deleteFile(fileUrl);

        // Then
        verify(minioClient, times(1)).removeObject(argThat(args -> {
            try {
                return args.bucket().equals(BUCKET) &&
                        args.object().equals("uuid_test-image.jpg");
            } catch (Exception e) {
                return false;
            }
        }));
    }

    @Test
    void deleteFile_ShouldDeleteObject_WhenUrlDoesNotContainImagesPath() throws Exception {
        // Given
        String fileUrl = "https://example.com/files/uuid_test-image.jpg";

        // When
        imageService.deleteFile(fileUrl);

        // Then
        verify(minioClient, times(1)).removeObject(argThat(args -> {
            try {
                return args.bucket().equals(BUCKET) &&
                        args.object().equals("uuid_test-image.jpg");
            } catch (Exception e) {
                return false;
            }
        }));
    }

    @Test
    void deleteFile_ShouldRemoveQueryParameters_FromObjectName() throws Exception {
        // Given
        String fileUrl = "/images/uuid_test-image.jpg?version=2";

        // When
        imageService.deleteFile(fileUrl);

        // Then
        verify(minioClient, times(1)).removeObject(argThat(args -> {
            try {
                return args.bucket().equals(BUCKET) &&
                        args.object().equals("uuid_test-image.jpg");
            } catch (Exception e) {
                return false;
            }
        }));
    }

    @Test
    void deleteFile_ShouldThrowRuntimeException_WhenMinioFails() throws Exception {
        // Given
        String fileUrl = "/images/test.jpg";
        doThrow(new RuntimeException("MinIO delete error"))
                .when(minioClient).removeObject(any(RemoveObjectArgs.class));

        // When & Then
        RuntimeException exception = assertThrows(RuntimeException.class, () -> {
            imageService.deleteFile(fileUrl);
        });

        assertEquals("Error deleting file", exception.getMessage());
    }
}
