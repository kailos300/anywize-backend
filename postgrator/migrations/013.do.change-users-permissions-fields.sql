UPDATE `users` SET `permissions` = JSON_OBJECT(
        "routesList", true,
        "routesMap", true,
        "routesCreateForDriver", true,
        "routesCreateDeliveryOrder", false,
        "ordersList", true,
        "ordersListSupplier", true,
        "ordersCreate", true,
        "customersCreate", true,
        "customersHideLocationRelatedFields", false,
        "toursCreate", true,
        "showMasterData", true,
        "showTourTab:, true
);
