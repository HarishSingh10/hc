package com.food.ordering.config;

import com.food.ordering.entity.*;
import com.food.ordering.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.Collections;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RestaurantRepository restaurantRepository;

    @Autowired
    private MenuItemRepository menuItemRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
        try {
            jdbcTemplate.execute("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;");
        } catch (Exception e) {
            System.out.println("Constraint drop skipped or not present: " + e.getMessage());
        }

        if (userRepository.count() == 0) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@food.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ADMIN)
                    .addresses(Collections.singletonList("Admin HQ, Suite 101, Tech Park"))
                    .build();
            userRepository.save(admin);

            User customer = User.builder()
                    .name("John Doe")
                    .email("customer@food.com")
                    .password(passwordEncoder.encode("customer123"))
                    .role(Role.CUSTOMER)
                    .addresses(Arrays.asList("123 Main St, Apt 4B, Foodville", "456 Office Lane, Worktown"))
                    .build();
            userRepository.save(customer);
        }

        if (restaurantRepository.count() == 0) {
            Restaurant burgerRest = Restaurant.builder()
                    .name("Gourmet Burgers")
                    .description("Juicy artisanal beef and vegetarian burgers crafted with organic, farm-fresh ingredients.")
                    .address("123 Burger St, Foodville")
                    .imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=600&auto=format&fit=crop&q=80")
                    .build();
            restaurantRepository.save(burgerRest);

            Restaurant pizzaRest = Restaurant.builder()
                    .name("Pizza Palace")
                    .description("Woodfired pizzas baked to order with signature sourdough base and imported mozzarella.")
                    .address("456 Pizza Ave, Pizzacity")
                    .imageUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=600&auto=format&fit=crop&q=80")
                    .build();
            restaurantRepository.save(pizzaRest);

            Restaurant spiceRest = Restaurant.builder()
                    .name("Spice Garden")
                    .description("Aromatic traditional Indian curries, tandooris, and slow-cooked rich biryanis.")
                    .address("789 Curry Lane, Spicetown")
                    .imageUrl("https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=600&auto=format&fit=crop&q=80")
                    .build();
            restaurantRepository.save(spiceRest);

            Restaurant dragonRest = Restaurant.builder()
                    .name("Dragon Express")
                    .description("Authentic sizzlers, stir-fries, handmade dim sums, and fiery Sichuan delicacies.")
                    .address("101 Wok Rd, Chinahills")
                    .imageUrl("https://images.unsplash.com/photo-1585032226651-759b368d7246?w=600&auto=format&fit=crop&q=80")
                    .build();
            restaurantRepository.save(dragonRest);

            menuItemRepository.saveAll(Arrays.asList(
                    MenuItem.builder()
                            .name("Classic Cheese Burger")
                            .description("Flame-grilled beef patty, cheddar, lettuce, tomato, pickles, and signature house sauce.")
                            .price(180.00)
                            .category("Fast Food")
                            .imageUrl("https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500")
                            .available(true)
                            .restaurant(burgerRest)
                            .build(),
                    MenuItem.builder()
                            .name("Spicy BBQ Chicken Burger")
                            .description("Crispy fried chicken breast, spicy barbecue sauce, jalapeños, and smoked gouda.")
                            .price(210.00)
                            .category("Fast Food")
                            .imageUrl("https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500")
                            .available(true)
                            .restaurant(burgerRest)
                            .build(),
                    MenuItem.builder()
                            .name("Ultimate Veggie Burger")
                            .description("Handmade quinoa and black bean patty, avocado spread, swiss cheese, and sprouts on a brioche bun.")
                            .price(160.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500")
                            .available(true)
                            .restaurant(burgerRest)
                            .build(),
                    MenuItem.builder()
                            .name("Loaded Cheese Fries")
                            .description("Golden French fries topped with warm cheese sauce, chopped chives, and spicy seasonings.")
                            .price(120.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1576107232684-1279f390859f?w=500")
                            .available(true)
                            .restaurant(burgerRest)
                            .build()
            ));

            menuItemRepository.saveAll(Arrays.asList(
                    MenuItem.builder()
                            .name("Margherita Sourdough Pizza")
                            .description("Simple elegance of San Marzano tomato sauce, fresh buffalo mozzarella, fresh basil, and extra virgin olive oil.")
                            .price(290.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1604068549290-dea0e4a305ca?w=500")
                            .available(true)
                            .restaurant(pizzaRest)
                            .build(),
                    MenuItem.builder()
                            .name("Double Pepperoni Feast")
                            .description("Rich tomato sauce, heaps of spicy pepperoni slices, and a blend of mozzarella and parmesan.")
                            .price(350.00)
                            .category("Non-Veg")
                            .imageUrl("https://images.unsplash.com/photo-1628840042765-356cda07504e?w=500")
                            .available(true)
                            .restaurant(pizzaRest)
                            .build(),
                    MenuItem.builder()
                            .name("Garden Supreme Pizza")
                            .description("Bell peppers, sweet corn, mushrooms, black olives, onions, and jalapenos on mozzarella crust.")
                            .price(320.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1513104890138-7c749659a591?w=500")
                            .available(true)
                            .restaurant(pizzaRest)
                            .build(),
                    MenuItem.builder()
                            .name("Cheesy Garlic Bread")
                            .description("Baked baguette slices brushed with garlic herb butter and melted mozzarella.")
                            .price(110.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?w=500")
                            .available(true)
                            .restaurant(pizzaRest)
                            .build()
            ));

            menuItemRepository.saveAll(Arrays.asList(
                    MenuItem.builder()
                            .name("Butter Chicken Deluxe")
                            .description("Tender tandoori chicken chunks cooked in a rich, creamy, and buttery spiced tomato gravy.")
                            .price(280.00)
                            .category("Non-Veg")
                            .imageUrl("https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?w=500")
                            .available(true)
                            .restaurant(spiceRest)
                            .build(),
                    MenuItem.builder()
                            .name("Paneer Tikka Masala")
                            .description("Char-grilled cottage cheese cubes simmered in a robust and aromatic onion tomato tikka gravy.")
                            .price(240.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=500")
                            .available(true)
                            .restaurant(spiceRest)
                            .build(),
                    MenuItem.builder()
                            .name("Hyderabadi Chicken Biryani")
                            .description("Long-grain basmati rice cooked in layers with spiced marinated chicken and rare spices, served with raita.")
                            .price(300.00)
                            .category("Non-Veg")
                            .imageUrl("https://images.unsplash.com/photo-1633945274405-b6c8069047b0?w=500")
                            .available(true)
                            .restaurant(spiceRest)
                            .build(),
                    MenuItem.builder()
                            .name("Butter Garlic Naan")
                            .description("Soft, leavened clay-oven flatbread topped with minced garlic and brushed with rich butter.")
                            .price(50.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1601050690597-df056fb4ce78?w=500")
                            .available(true)
                            .restaurant(spiceRest)
                            .build()
            ));

            menuItemRepository.saveAll(Arrays.asList(
                    MenuItem.builder()
                            .name("Schezwan Hakka Noodles")
                            .description("Wok-tossed noodles with colorful julienned vegetables and fiery Schezwan chili paste.")
                            .price(160.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1585032226651-759b368d7246?w=500")
                            .available(true)
                            .restaurant(dragonRest)
                            .build(),
                    MenuItem.builder()
                            .name("Crispy Spring Rolls")
                            .description("Golden fried rolls stuffed with seasoned minced vegetables, served with sweet chili dip.")
                            .price(120.00)
                            .category("Veg")
                            .imageUrl("https://images.unsplash.com/photo-1544025162-d76694265947?w=500")
                            .available(true)
                            .restaurant(dragonRest)
                            .build(),
                    MenuItem.builder()
                            .name("Kung Pao Chicken")
                            .description("Stir-fried chicken cubes with peanuts, bell peppers, scallions, and dry red chilies.")
                            .price(260.00)
                            .category("Non-Veg")
                            .imageUrl("https://images.unsplash.com/photo-1525755662778-989d0524087e?w=500")
                            .available(true)
                            .restaurant(dragonRest)
                            .build()
            ));
        }
    }
}
