package com.food.ordering.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

@Controller
public class ForwardController {

    // Forwards any requests that do not contain a dot (like /cart or /admin) to index.html
    // Allows static resources (which contain a dot, like .css or .js) to be handled by Spring automatically
    @RequestMapping(value = "/**/{path:[^\\.]*}")
    public String forward() {
        return "forward:/index.html";
    }
}
