const MOCK_EMAIL = "admin@aino.com";
const MOCK_PASS = "admin123";
const MOCK_USERS = [
    {
        id: "u-1",
        email: "admin@aino.com",
        name: "Admin",
        role: "admin",
        permissions: ["view", "create", "edit", "delete", "manage_users", "manage_roles", "system_settings", "export_data", "api_access"]
    },
    {
        id: "u-2",
        email: "operator@aino.com",
        name: "Operator",
        role: "operator",
        permissions: ["view", "create", "edit", "delete", "export_data"]
    },
    {
        id: "u-3",
        email: "viewer@aino.com",
        name: "Viewer",
        role: "viewer",
        permissions: ["view"]
    }
];
export async function loginSvc(body) {
    if (body.email === MOCK_EMAIL && body.password === MOCK_PASS) {
        return {
            token: "test-token",
            user: {
                id: "u-1",
                email: MOCK_EMAIL,
                name: "Admin"
            }
        };
    }
    throw new Error("INVALID_CREDENTIALS");
}
export async function getCurrentUserSvc(token) {
    if (token === "test-token") {
        return MOCK_USERS[0];
    }
    throw new Error("INVALID_TOKEN");
}
//# sourceMappingURL=service.js.map