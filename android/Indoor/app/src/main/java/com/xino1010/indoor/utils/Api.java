package com.xino1010.indoor.utils;

import android.app.Activity;
import android.app.Application;
import android.content.Context;
import android.util.Log;
import android.widget.TextView;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;
import com.xino1010.indoor.BuildConfig;
import com.xino1010.indoor.MainActivity;
import com.xino1010.indoor.R;
import com.xino1010.indoor.fragments.KpiFragment;
import com.xino1010.indoor.models.User;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

/**
 * Created by dani on 3/07/17.
 */

public class Api {

    public static void login(final Context context, final String username, final String password, final TextView errorLogintextView) {
        RequestQueue queue = Volley.newRequestQueue(context);
        String url = BuildConfig.BASE_URL + "/auth/login";
        StringRequest postRequest = new StringRequest(Request.Method.POST, url,
                new Response.Listener<String>() {
                    @Override
                    public void onResponse(String response) {
                        try {
                            Log.d(Constants.APP_NAME, response);
                            JSONObject result = new JSONObject(response);
                            Log.d(Constants.APP_NAME, result.toString());
                            if (result.has("code")) {
                                int code = result.getInt("code");
                                if (code == 0) {
                                    errorLogintextView.setText(result.getString("message"));
                                } else if (code == 1) {
                                    errorLogintextView.setText(result.getString("message"));
                                    User user = new User(result.getJSONObject("user"));
                                    MySingleton.getInstance().setUser(user);
                                    Activity activity = (MainActivity) context;
                                    KpiFragment kpiFragment = new KpiFragment();
                                    activity.getFragmentManager().beginTransaction().replace(R.id.frameContainer, kpiFragment).commit();
                                }
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }
                },
                new Response.ErrorListener() {
                    @Override
                    public void onErrorResponse(VolleyError error) {
                        Log.d(Constants.APP_NAME, "Coult not parse malformed JSON: " + error.toString());
                        errorLogintextView.setText(error.toString());
                    }
                }
        ) {
            @Override
            protected Map<String, String> getParams() {
                Map<String, String>  params = new HashMap<String, String>();
                params.put("username", username);
                params.put("password", password);
                return params;
            }
        };

        queue.add(postRequest);
    }

}
