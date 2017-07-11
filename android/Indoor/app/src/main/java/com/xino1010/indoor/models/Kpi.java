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
            if (data.has("key") && !data.isNull("key"))
                setKey(data.getString("key"));
            if (data.has("value") && !data.isNull("value"))
                setValue(data.getDouble("value"));
            if (data.has("name") && !data.isNull("name"))
                setName(data.getString("name"));
            if (data.has("unity") && !data.isNull("unity"))
                setUnity(data.getString("unity"));
            if (data.has("color") && !data.isNull("color"))
                setColor(data.getString("color"));
            if (data.has("colorActivated") && !data.isNull("canActivated"))
                setColorActivated(data.getString("colorActivated"));
            if (data.has("icon") && !data.isNull("icon"))
                setIcon(data.getString("icon"));
            if (data.has("canBeActivated") && !data.isNull("canBeActivated"))
                setCanBeActivated(data.getBoolean("canBeActivated"));
            if (data.has("activated") && !data.isNull("activated"))
                setActivated(data.getBoolean("activated"));
            if (data.has("editable") && !data.isNull("editable"))
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
