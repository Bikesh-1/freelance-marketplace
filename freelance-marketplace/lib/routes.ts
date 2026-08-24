export const ROUTES = {
    home: "/",

    auth: {
        login: "/login",
        register: "/register",
    },

    client: {
        dashboard: "/client/dashboard",
    },

    freelancer: {
        dashboard: "/freelancer/dashboard",
    },

    admin: {
        dashboard: "/admin",
    },
} as const;

export function getDashboardRoute(role?: string | null) {
    switch (role) {
        case "CLIENT":
            return ROUTES.client.dashboard;

        case "FREELANCER":
            return ROUTES.freelancer.dashboard;

        case "ADMIN":
            return ROUTES.admin.dashboard;

        default:
            return ROUTES.auth.login;
    }
}