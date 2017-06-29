package com.xino1010.indoor;

import android.content.Context;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.support.v7.appcompat.*;
import android.util.Log;
import android.view.View;
import android.widget.Button;

import com.android.volley.Request;
import com.android.volley.RequestQueue;
import com.android.volley.Response;
import com.android.volley.VolleyError;
import com.android.volley.toolbox.StringRequest;
import com.android.volley.toolbox.Volley;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Map;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "INDOOR";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        final Context context = getApplicationContext();

        final View loginButton = findViewById(R.id.loginButton);
        loginButton.setOnClickListener(new View.OnClickListener(){
            @Override
            public void onClick(View view) {
                Log.d(TAG, "Login button click");

                RequestQueue queue = Volley.newRequestQueue(context);
                String url = BuildConfig.BASE_URL + "/auth/login";
                StringRequest postRequest = new StringRequest(Request.Method.POST, url,
                    new Response.Listener<String>() {
                        @Override
                        public void onResponse(String response) {
                            try {
                                Log.d(TAG, response);
                                JSONObject obj = new JSONObject(response);
                                Log.d(TAG, obj.toString());
                            } catch (JSONException e) {
                                e.printStackTrace();
                            }
                        }
                    },
                    new Response.ErrorListener() {
                        @Override
                        public void onErrorResponse(VolleyError error) {
                            // error
                            Log.d(TAG, "Coult not parse malformed JSON: " + error.toString());
                        }
                    }
                ) {
                    @Override
                    protected Map<String, String> getParams() {
                        Map<String, String>  params = new HashMap<String, String>();
                        params.put("username", "xino1010");
                        params.put("password", "Amistat1");
                        return params;
                    }
                };

                queue.add(postRequest);
            }
        });

    }

}
