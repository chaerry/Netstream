package id.co.netstream.inventory.config;

import jakarta.ws.rs.core.Application;
import org.eclipse.microprofile.openapi.annotations.OpenAPIDefinition;
import org.eclipse.microprofile.openapi.annotations.enums.SecuritySchemeType;
import org.eclipse.microprofile.openapi.annotations.info.Contact;
import org.eclipse.microprofile.openapi.annotations.info.Info;
import org.eclipse.microprofile.openapi.annotations.security.OAuthFlow;
import org.eclipse.microprofile.openapi.annotations.security.OAuthFlows;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.security.SecurityScheme;

@OpenAPIDefinition(
        info = @Info(
                title = "Netstream Telecom Inventory API (VC4 S2C Model)",
                version = "1.0.0",
                description = "High-performance REST API services for Physical, Logical, Virtual, and Service Inventory management with Keycloak RBAC.",
                contact = @Contact(name = "Netstream Architecture Team", email = "architecture@netstream.co.id")
        ),
        security = @SecurityRequirement(name = "Keycloak-OIDC")
)
@SecurityScheme(
        securitySchemeName = "Keycloak-OIDC",
        type = SecuritySchemeType.OAUTH2,
        description = "Keycloak OIDC Authentication",
        flows = @OAuthFlows(
                authorizationCode = @OAuthFlow(
                        authorizationUrl = "https://keycloak.aitiserve.co.id:8095/realms/aitiserve/protocol/openid-connect/auth",
                        tokenUrl = "https://keycloak.aitiserve.co.id:8095/realms/aitiserve/protocol/openid-connect/token"
                )
        )
)
public class OpenApiConfig extends Application {
}
