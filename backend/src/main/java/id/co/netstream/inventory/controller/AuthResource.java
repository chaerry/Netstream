package id.co.netstream.inventory.controller;

import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Path("/api/v1/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@PermitAll
public class AuthResource {

    @ConfigProperty(name = "quarkus.oidc.auth-server-url", defaultValue = "https://keycloak.aitiserve.co.id:8095/realms/aitiserve")
    String keycloakAuthServerUrl;

    @ConfigProperty(name = "quarkus.oidc.client-id", defaultValue = "itsm_gaharu")
    String keycloakClientId;

    @ConfigProperty(name = "quarkus.oidc.credentials.secret", defaultValue = "itsm123")
    String keycloakClientSecret;

    @POST
    @Path("/login")
    @PermitAll
    public Response login(Map<String, String> credentials) {
        String username = credentials.getOrDefault("username", "admin");
        try {
            String tokenEndpoint = keycloakAuthServerUrl + "/protocol/openid-connect/token";
            URL url = new URL(tokenEndpoint);
            HttpURLConnection conn = (HttpURLConnection) url.openConnection();
            conn.setRequestMethod("POST");
            conn.setRequestProperty("Content-Type", "application/x-www-form-urlencoded");
            conn.setDoOutput(true);
            conn.setConnectTimeout(8000);
            conn.setReadTimeout(8000);

            String requestBody = "client_id=" + keycloakClientId +
                    "&client_secret=" + keycloakClientSecret +
                    "&grant_type=client_credentials";

            try (OutputStream os = conn.getOutputStream()) {
                os.write(requestBody.getBytes(StandardCharsets.UTF_8));
            }

            int responseCode = conn.getResponseCode();
            if (responseCode >= 200 && responseCode < 300) {
                try (InputStream is = conn.getInputStream()) {
                    String jsonResponse = new String(is.readAllBytes(), StandardCharsets.UTF_8);
                    return Response.ok(jsonResponse).build();
                }
            } else {
                try (InputStream es = conn.getErrorStream()) {
                    String errResponse = es != null ? new String(es.readAllBytes(), StandardCharsets.UTF_8) : "Unknown Keycloak error";
                    return Response.status(responseCode).entity(errResponse).build();
                }
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Keycloak connection failed: " + e.getMessage()))
                    .build();
        }
    }
}
