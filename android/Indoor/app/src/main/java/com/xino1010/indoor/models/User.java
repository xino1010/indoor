package com.xino1010.indoor.models;

import com.xino1010.indoor.MyFunctions;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Date;

/**
 * Created by dani on 3/07/17.
 */

public class User {

    private String id;
    private String username;
    private String email;
    private String status;
    private Date lastLogout;
    private Date lastLogin;
    private String name;
    private String socketId;

    public User(JSONObject userData) {
        try {
            this.setId(userData.getString("_id"));
            this.setUsername(userData.getString("username"));
            this.setEmail(userData.getString("email"));
            this.setStatus(userData.getString("status"));
            this.setLastLogout(MyFunctions.dateFromString(userData.getString("lastlogout")));
            this.setLastLogin(MyFunctions.dateFromString(userData.getString("lastlogin")));
            this.setName(userData.getString("name"));
            this.setSocketId(userData.getString("socketid"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public String getId() {
        return id;
    }

    public void setId(String _id) {
        this.id = _id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Date getLastLogout() {
        return lastLogout;
    }

    public void setLastLogout(Date lastLogout) {
        this.lastLogout = lastLogout;
    }

    public Date getLastLogin() {
        return lastLogin;
    }

    public void setLastLogin(Date lastLogin) {
        this.lastLogin = lastLogin;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSocketId() {
        return socketId;
    }

    public void setSocketId(String socketId) {
        this.socketId = socketId;
    }
}
