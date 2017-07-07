package com.xino1010.indoor.adapters;

import android.content.Context;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;

import com.xino1010.indoor.models.Kpi;

import java.util.HashMap;

/**
 * Created by danielandujarlorenzo on 7/7/17.
 */

public class KpiAdapter extends BaseAdapter {

    private HashMap<String, Kpi> data = new HashMap<String, Kpi>();
    private String[] kpiKeys;
    private Context context;

    public KpiAdapter(HashMap<String, Kpi> data, Context context) {
        this.data = data;
        this.kpiKeys = data.keySet().toArray(new String[data.size()]);
        this.context = context;
    }

    @Override
    public int getCount() {
        return data.size();
    }

    @Override
    public Object getItem(int position) {
        return this.data.get(this.kpiKeys[position]);
    }

    @Override
    public long getItemId(int arg0) {
        return arg0;
    }

    @Override
    public View getView(int position, View view, ViewGroup viewGroup) {
        String kpiKey = this.kpiKeys[position];
        Kpi kpi = this.data.get(kpiKey);
        return view;
    }
}
