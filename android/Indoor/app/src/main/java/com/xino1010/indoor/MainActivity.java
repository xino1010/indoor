package com.xino1010.indoor;

import android.content.Context;
import android.content.SharedPreferences;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.view.View;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

public class MainActivity extends AppCompatActivity {

    private static final String TAG = "INDOOR";
    private EditText usernameEditText;
    private EditText passwordEditText;
    private TextView errorLogintextView;
    private Context context;
    private Button loginButton;

    @Override
    public void onResume() {
        super.onResume();
        loadLoginPreferences();
    }

    @Override
    public void onPause() {
        super.onPause();
        saveLoginPreferences();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // Init widgets from view
        this.context = getApplicationContext();
        this.usernameEditText = (EditText) findViewById(R.id.usernameEditText);
        this.passwordEditText = (EditText) findViewById(R.id.passwordEditText);
        this.errorLogintextView = (TextView) findViewById(R.id.errorLogintextView);
        this.loginButton = (Button) findViewById(R.id.loginButton);

        this.loginButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                errorLogintextView.setText("");
                String username = usernameEditText.getText().toString();
                if (username.isEmpty()) {
                    errorLogintextView.setText("User field can not be empty");
                    return;
                }
                String password = passwordEditText.getText().toString();
                if (password.isEmpty()) {
                    errorLogintextView.setText("Password field can not be empty");
                    return;
                }
                Api.login(context, username, password, errorLogintextView);
            }
        });
    }

    private void saveLoginPreferences() {
        SharedPreferences settings = getSharedPreferences(Constants.APP_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = settings.edit();
        String username = usernameEditText.getText().toString();
        String password = passwordEditText.getText().toString();
        System.out.println("onPause save username: " + username);
        System.out.println("onPause save password: " + password);
        editor.putString(Constants.PREFERENCES_USERNAME, username);
        editor.putString(Constants.PREFERENCES_PASSWORD, password);
        editor.commit();
    }

    private void loadLoginPreferences() {
        SharedPreferences settings = getSharedPreferences(Constants.APP_NAME, Context.MODE_PRIVATE);
        String usernamePreferences = settings.getString(Constants.PREFERENCES_USERNAME, "");
        String passwordPreferences = settings.getString(Constants.PREFERENCES_PASSWORD, "");
        System.out.println("onResume load name: " + usernamePreferences);
        System.out.println("onResume load password: " + passwordPreferences);
        if (!usernamePreferences.isEmpty() || !passwordPreferences.isEmpty()) {
            Api.login(context, usernamePreferences, passwordPreferences, errorLogintextView);
        }
    }

}
