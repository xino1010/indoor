package com.xino1010.indoor.fragments;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.app.Fragment;
import android.util.Log;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.Toast;

import com.google.firebase.iid.FirebaseInstanceId;
import com.xino1010.indoor.IndoorApplication;
import com.xino1010.indoor.R;
import com.xino1010.indoor.adapters.KpiAdapter;
import com.xino1010.indoor.models.Kpi;
import com.xino1010.indoor.utils.Constants;
import com.xino1010.indoor.utils.MySingleton;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.HashMap;
import java.util.Iterator;

import io.socket.client.Socket;
import io.socket.emitter.Emitter;

public class KpiFragment extends Fragment {

    private Socket socket;
    private HashMap<String, Kpi> kpis = new HashMap<String, Kpi>();
    private OnFragmentInteractionListener mListener;
    private KpiAdapter kpiAdapter;
    private boolean socketConnected = false;

    public KpiFragment() {
        // Required empty public constructor
    }

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        // Init vars
        IndoorApplication app = (IndoorApplication) getActivity().getApplication();
        kpiAdapter = new KpiAdapter(kpis, getContext());
        this.socket = app.getSocket();
        this.socket.on(Socket.EVENT_CONNECT, onSocketConnect);
        this.socket.on(Socket.EVENT_DISCONNECT, onSocketDisconnect);
        this.socket.on(Socket.EVENT_RECONNECT, onSocketReconnect);
        this.socket.on(Socket.EVENT_CONNECT_ERROR, onSocketConnectError);
        this.socket.on(Socket.EVENT_CONNECT_TIMEOUT, onSocketConnectError);
        this.socket.on(Constants.SOCKET_KPIS, onKpis);
        this.socket.connect();
    }

    @Override
    public View onCreateView(LayoutInflater inflater, ViewGroup container, Bundle savedInstanceState) {
        View view = inflater.inflate(R.layout.fragment_kpi, container, false);
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
    public void onDestroy() {
        super.onDestroy();
        this.socket.disconnect();
        this.socket.off(Socket.EVENT_CONNECT, onSocketConnect);
        this.socket.off(Socket.EVENT_DISCONNECT, onSocketDisconnect);
        this.socket.off(Socket.EVENT_CONNECT_ERROR, onSocketConnectError);
        this.socket.off(Socket.EVENT_CONNECT_TIMEOUT, onSocketConnectError);
        this.socket.off(Constants.SOCKET_KPIS, onKpis);
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

    private Emitter.Listener onSocketConnect = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (socketConnected == false) {
                        Toast.makeText(getContext(), "Connected to WS", Toast.LENGTH_LONG).show();
                        socketConnected = true;
                        socket.emit(Constants.SCOCKET_FCM_TOKEN, FirebaseInstanceId.getInstance().getToken());
                        socket.emit(Constants.SOCKET_USER_ID, MySingleton.getInstance().getUser().getId());
                    }
                }
            });
        }
    };

    private Emitter.Listener onSocketDisconnect = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    socketConnected = false;
                    Toast.makeText(getContext(), "Disconnected to WS", Toast.LENGTH_LONG).show();
                }
            });
        }
    };

    private Emitter.Listener onSocketReconnect = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    if (socketConnected == false) {
                        Toast.makeText(getContext(), "Reconnected to WS", Toast.LENGTH_LONG).show();
                        socketConnected = true;
                        socket.emit(Constants.SOCKET_USER_ID, MySingleton.getInstance().getUser().getId());
                    }
                }
            });
        }
    };

    private Emitter.Listener onSocketConnectError = new Emitter.Listener() {
        @Override
        public void call(Object... args) {
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    Toast.makeText(getContext(), "Error connecting to WS", Toast.LENGTH_LONG).show();
                }
            });
        }
    };

    private Emitter.Listener onKpis = new Emitter.Listener() {
        @Override
        public void call(final Object... args) {
            getActivity().runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    JSONObject data = (JSONObject) args[0];
                    Log.i(Constants.APP_NAME, data.toString());
                    Iterator<?> keys = data.keys();
                    while (keys.hasNext()) {
                        String kpiKey = (String) keys.next();
                        try {
                            if (data.get(kpiKey) instanceof  JSONObject) {
                                JSONObject currentKpi = (JSONObject) data.get(kpiKey);
                                Kpi kpi = new Kpi(currentKpi);
                                kpis.put(kpiKey, kpi);
                            }
                        } catch (JSONException e) {
                            e.printStackTrace();
                        }
                    }

                    kpiAdapter.notifyDataSetChanged();
                }
            });
        }
    };

}
