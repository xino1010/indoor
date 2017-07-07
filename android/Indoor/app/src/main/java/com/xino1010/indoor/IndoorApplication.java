package com.xino1010.indoor;

import android.app.Application;

import java.net.URISyntaxException;

import io.socket.client.IO;
import io.socket.client.Socket;

/**
 * Created by danielandujarlorenzo on 7/7/17.
 */

public class IndoorApplication extends Application {

    private Socket socket;
    {
        try {
            socket = IO.socket(BuildConfig.BASE_URL);
        } catch (URISyntaxException e) {
            throw new RuntimeException(e);
        }
    }

    public Socket getSocket() {
        return this.socket;
    }

}
