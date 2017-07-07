package com.xino1010.indoor.utils;

import com.xino1010.indoor.models.User;

/**
 * Created by dani on 3/07/17.
 */

public class MySingleton {

    private static final MySingleton instance = new MySingleton();
    private User user;

    // Private constructor prevents instantiation from other classes
    private MySingleton() {
    }

    public static MySingleton getInstance() {
        return instance;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public User getUser() {
        return this.user;
    }

}
