package com.xino1010.indoor.models;

import org.json.JSONException;
import org.json.JSONObject;

/**
 * Created by danielandujarlorenzo on 7/7/17.
 */

public class Kpi {

    private String key;
    private double value;
    private String name;
    private String unity;
    private String color;
    private String colorActivated;
    private String icon;
    private boolean canBeActivated;
    private boolean activated;
    private boolean editable;

    public Kpi(String key, double value, String name, String unity, String color,
               String colorActivated, String icon, boolean canBeActivated, boolean activated,
               boolean editable) {
        setKey(key);
        setValue(value);
        setName(name);
        setUnity(unity);
        setColor(color);
        setColorActivated(colorActivated);
        setIcon(icon);
        setCanBeActivated(canBeActivated);
        setActivated(activated);
        setEditable(editable);
    }

    public Kpi(JSONObject data) {
        try {
            setKey(data.getString("key"));
            setValue(data.getDouble("value"));
            setName(data.getString("name"));
            setUnity(data.getString("unity"));
            setColor(data.getString("color"));
            setColorActivated(data.getString("colorActivated"));
            setIcon(data.getString("icon"));
            setCanBeActivated(data.getBoolean("canBeActivated"));
            setActivated(data.getBoolean("activated"));
            setEditable(data.getBoolean("editable"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
    }

    public String getKey() {
        return key;
    }

    public void setKey(String key) {
        this.key = key;
    }

    public double getValue() {
        return value;
    }

    public void setValue(double value) {
        this.value = value;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getUnity() {
        return unity;
    }

    public void setUnity(String unity) {
        this.unity = unity;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getColorActivated() {
        return colorActivated;
    }

    public void setColorActivated(String colorActivated) {
        this.colorActivated = colorActivated;
    }

    public String getIcon() {
        return icon;
    }

    public void setIcon(String icon) {
        this.icon = icon;
    }

    public boolean isCanBeActivated() {
        return canBeActivated;
    }

    public void setCanBeActivated(boolean canBeActivated) {
        this.canBeActivated = canBeActivated;
    }

    public boolean isActivated() {
        return activated;
    }

    public void setActivated(boolean activated) {
        this.activated = activated;
    }

    public boolean isEditable() {
        return editable;
    }

    public void setEditable(boolean editable) {
        this.editable = editable;
    }

}
