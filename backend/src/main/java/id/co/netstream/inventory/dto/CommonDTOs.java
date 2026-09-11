package id.co.netstream.inventory.dto;

import java.time.OffsetDateTime;
import java.util.List;

public class CommonDTOs {

    public record PagedResponse<T>(
            List<T> items,
            long totalElements,
            int totalPages,
            int currentPage,
            int pageSize
    ) {}

    public record ProblemDetail(
            String type,
            String title,
            int status,
            String detail,
            String instance,
            OffsetDateTime timestamp,
            List<String> validationErrors
    ) {}

    public record SuccessMessageResponse(
            String message,
            OffsetDateTime timestamp
    ) {
        public static SuccessMessageResponse of(String message) {
            return new SuccessMessageResponse(message, OffsetDateTime.now());
        }
    }
}
