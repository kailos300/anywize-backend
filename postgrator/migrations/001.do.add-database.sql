SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

CREATE TABLE `customers` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `tour_id` int(11) NOT NULL,
  `tour_position` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `street_number` varchar(45) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zipcode` varchar(45) DEFAULT NULL,
  `country` varchar(2) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `sms_notifications` tinyint(4) NOT NULL DEFAULT '0',
  `email_notifications` tinyint(4) NOT NULL DEFAULT '0',
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `drivers_positions` (
  `id` int(11) NOT NULL,
  `route_id` int(11) DEFAULT NULL,
  `position` point DEFAULT NULL,
  `created_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `description` tinytext NOT NULL,
  `delivered_at` datetime DEFAULT NULL,
  `number` varchar(100) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `routes` (
  `id` int(11) NOT NULL,
  `tour_id` int(11) DEFAULT NULL,
  `route` json DEFAULT NULL,
  `start_date` datetime DEFAULT NULL,
  `end_date` datetime DEFAULT NULL,
  `code` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `stops` (
  `id` int(11) NOT NULL,
  `customer_id` int(11) NOT NULL,
  `time` datetime NOT NULL,
  `signature_file` varchar(200) DEFAULT NULL,
  `location` point NOT NULL,
  `pictures` json DEFAULT NULL,
  `meet_customer` tinyint(1) NOT NULL,
  `reason` varchar(1000) DEFAULT NULL,
  `route_id` int(11) NOT NULL,
  `driver_name` varchar(255) NOT NULL,
  `goods_back` tinyint(1) DEFAULT '0',
  `customer_signed` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `street_number` varchar(45) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zipcode` varchar(100) DEFAULT NULL,
  `country` varchar(2) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `phone` varchar(100) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `tours` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) NOT NULL,
  `transport_agent_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `active` tinyint(1) DEFAULT '1',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `transport_agents` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `alias` varchar(255) DEFAULT NULL,
  `street` varchar(255) DEFAULT NULL,
  `number` varchar(45) DEFAULT NULL,
  `city` varchar(100) DEFAULT NULL,
  `zipcode` varchar(45) DEFAULT NULL,
  `country` varchar(2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `name` varchar(255) NOT NULL,
  `surname` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `password` varchar(100) NOT NULL,
  `token` varchar(255) NOT NULL,
  `active` tinyint(1) DEFAULT '1',
  `admin` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL,
  `updated_at` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;


ALTER TABLE `customers`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_customers_1_idx` (`supplier_id`),
  ADD KEY `fk_customers_2_idx` (`tour_id`);

ALTER TABLE `drivers_positions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_drivers_positions_2_idx` (`route_id`);

ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_orders_1_idx` (`customer_id`);

ALTER TABLE `routes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_routes_1_idx` (`tour_id`);

ALTER TABLE `stops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_stops_3_idx` (`route_id`),
  ADD KEY `fk_stops_1_idx` (`customer_id`);

ALTER TABLE `suppliers`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `tours`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_tours_1_idx` (`supplier_id`),
  ADD KEY `fk_tours_2_idx` (`transport_agent_id`);

ALTER TABLE `transport_agents`
  ADD PRIMARY KEY (`id`);

ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_users_1_idx` (`supplier_id`);


ALTER TABLE `customers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `drivers_positions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `routes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `stops`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `tours`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `transport_agents`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;


ALTER TABLE `customers`
  ADD CONSTRAINT `fk_customers_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_customers_2` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `drivers_positions`
  ADD CONSTRAINT `fk_drivers_positions_2` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `orders`
  ADD CONSTRAINT `fk_orders_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `routes`
  ADD CONSTRAINT `fk_routes_1` FOREIGN KEY (`tour_id`) REFERENCES `tours` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `stops`
  ADD CONSTRAINT `fk_stops_1` FOREIGN KEY (`customer_id`) REFERENCES `customers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_stops_3` FOREIGN KEY (`route_id`) REFERENCES `routes` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `tours`
  ADD CONSTRAINT `fk_tours_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION,
  ADD CONSTRAINT `fk_tours_2` FOREIGN KEY (`transport_agent_id`) REFERENCES `transport_agents` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

ALTER TABLE `users`
  ADD CONSTRAINT `fk_users_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;
COMMIT;
