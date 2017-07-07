package com.xino1010.indoor;

import android.app.FragmentManager;
import android.app.FragmentTransaction;
import android.net.Uri;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;

import com.xino1010.indoor.fragments.KpiFragment;
import com.xino1010.indoor.fragments.LoginFragment;
import com.xino1010.indoor.utils.MySingleton;

public class MainActivity extends AppCompatActivity implements LoginFragment.OnFragmentInteractionListener, KpiFragment.OnFragmentInteractionListener {

    private MySingleton mySingleton = MySingleton.getInstance();

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.main_activity);

        FragmentManager fragmentManager = getFragmentManager();
        FragmentTransaction fragmentTransaction = fragmentManager.beginTransaction();
        if (this.mySingleton.getUser() == null) {
            LoginFragment loginFragment = new LoginFragment();
            fragmentTransaction.replace(R.id.frameContainer, loginFragment);
        }
        else {
            KpiFragment kpiFragment = new KpiFragment();
            fragmentTransaction.replace(R.id.frameContainer, kpiFragment);
        }
        fragmentTransaction.commit();

    }

    @Override
    public void onFragmentInteraction(Uri uri){
        //you can leave it empty
    }

}
