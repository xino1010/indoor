package com.xino1010.indoor.fragments;

import android.content.Context;
import android.content.SharedPreferences;
import android.net.Uri;
import android.os.Bundle;
import android.app.Fragment;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Button;
import android.widget.EditText;
import android.widget.TextView;

import com.xino1010.indoor.utils.Api;
import com.xino1010.indoor.utils.Constants;
import com.xino1010.indoor.R;


public class LoginFragment extends Fragment {

    private EditText usernameEditText;
    private EditText passwordEditText;
    private TextView errorLogintextView;
    private Button loginButton;

    private OnFragmentInteractionListener mListener;

    public LoginFragment() {
        // Required empty public constructor
    }

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
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        // Inflate the layout for this fragment
        View view = inflater.inflate(R.layout.fragment_login, container, false);
        this.usernameEditText = (EditText) view.findViewById(R.id.usernameEditText);
        this.passwordEditText = (EditText) view.findViewById(R.id.passwordEditText);
        this.errorLogintextView = (TextView) view.findViewById(R.id.errorLogintextView);
        this.loginButton = (Button) view.findViewById(R.id.loginButton);

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
                Api.login(getContext(), username, password, errorLogintextView);
            }
        });

        return view;
    }

    // TODO: Rename method, update argument and hook method into UI event
    public void onButtonPressed(Uri uri) {
        if (mListener != null) {
            mListener.onFragmentInteraction(uri);
        }
    }

    @Override
    public void onAttach(Context context) {
        super.onAttach(context);
        if (context instanceof OnFragmentInteractionListener) {
            mListener = (OnFragmentInteractionListener) context;
        } else {
            throw new RuntimeException(context.toString() + " must implement OnFragmentInteractionListener");
        }
    }

    @Override
    public void onDetach() {
        super.onDetach();
        mListener = null;
    }

    /**
     * This interface must be implemented by activities that contain this
     * fragment to allow an interaction in this fragment to be communicated
     * to the activity and potentially other fragments contained in that
     * activity.
     * <p>
     * See the Android Training lesson <a href=
     * "http://developer.android.com/training/basics/fragments/communicating.html"
     * >Communicating with Other Fragments</a> for more information.
     */
    public interface OnFragmentInteractionListener {
        // TODO: Update argument type and name
        void onFragmentInteraction(Uri uri);
    }

    private void saveLoginPreferences() {
        SharedPreferences settings = getActivity().getSharedPreferences(Constants.APP_NAME, Context.MODE_PRIVATE);
        SharedPreferences.Editor editor = settings.edit();
        String username = usernameEditText.getText().toString();
        String password = passwordEditText.getText().toString();
        System.out.println("onPause save username: " + username);
        System.out.println("onPause save password: " + password);
        if (username != null && !username.isEmpty() && password != null && !password.isEmpty()) {
            editor.putString(Constants.PREFERENCES_USERNAME, username);
            editor.putString(Constants.PREFERENCES_PASSWORD, password);
            editor.commit();
        }
    }

    private void loadLoginPreferences() {
        SharedPreferences settings = getActivity().getSharedPreferences(Constants.APP_NAME, Context.MODE_PRIVATE);
        String usernamePreferences = settings.getString(Constants.PREFERENCES_USERNAME, "");
        String passwordPreferences = settings.getString(Constants.PREFERENCES_PASSWORD, "");
        System.out.println("onResume load name: " + usernamePreferences);
        System.out.println("onResume load password: " + passwordPreferences);
        if (!usernamePreferences.isEmpty() || !passwordPreferences.isEmpty()) {
            Api.login(getContext(), usernamePreferences, passwordPreferences, errorLogintextView);
        }
    }
}
