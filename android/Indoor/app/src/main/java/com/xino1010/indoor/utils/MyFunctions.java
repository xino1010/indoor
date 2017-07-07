package com.xino1010.indoor.utils;

import java.text.DateFormat;
import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.Date;

/**
 * Created by dani on 3/07/17.
 */

public class MyFunctions {

    public static Date dateFromString(String dateTime) {
        if (dateTime.isEmpty() || dateTime.equals("null"))
            return null;
        SimpleDateFormat date = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        try {
            return date.parse(dateTime);
        } catch (ParseException e) {
            e.printStackTrace();
        }
        return null;
    }

}
