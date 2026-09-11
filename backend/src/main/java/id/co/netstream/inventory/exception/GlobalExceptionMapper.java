package id.co.netstream.inventory.exception;

import id.co.netstream.inventory.dto.CommonDTOs.ProblemDetail;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;
import org.jboss.logging.Logger;

import java.time.OffsetDateTime;
import java.util.List;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Throwable> {

    private static final Logger LOG = Logger.getLogger(GlobalExceptionMapper.class);

    @Override
    public Response toResponse(Throwable ex) {
        LOG.error("Exception intercepted by GlobalExceptionMapper", ex);

        if (ex instanceof ResourceNotFoundException rnfe) {
            return buildResponse(Response.Status.NOT_FOUND, "Resource Not Found", rnfe.getMessage(), null);
        }

        if (ex instanceof DuplicateEntityException dee) {
            return buildResponse(Response.Status.CONFLICT, "Data Conflict", dee.getMessage(), null);
        }

        if (ex instanceof ConstraintViolationException cve) {
            List<String> errors = cve.getConstraintViolations().stream()
                    .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                    .toList();
            return buildResponse(Response.Status.BAD_REQUEST, "Validation Error", "Invalid input parameters", errors);
        }

        if (ex instanceof WebApplicationException wae) {
            return buildResponse(
                    Response.Status.fromStatusCode(wae.getResponse().getStatus()),
                    "HTTP Request Error",
                    wae.getMessage(),
                    null
            );
        }

        return buildResponse(
                Response.Status.INTERNAL_SERVER_ERROR,
                "Internal Server Error",
                "An unexpected internal error occurred. Please contact the administrator.",
                null
        );
    }

    private Response buildResponse(Response.Status status, String title, String detail, List<String> errors) {
        ProblemDetail problem = new ProblemDetail(
                "urn:netstream:error:" + (status != null ? status.getStatusCode() : 500),
                title,
                status != null ? status.getStatusCode() : 500,
                detail,
                null,
                OffsetDateTime.now(),
                errors
        );
        return Response.status(status != null ? status : Response.Status.INTERNAL_SERVER_ERROR)
                .type(MediaType.APPLICATION_JSON)
                .entity(problem)
                .build();
    }
}
