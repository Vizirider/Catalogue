package com.example.nodejs;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.LinearLayoutManager;
import android.support.v7.widget.RecyclerView;
import android.view.View;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

import com.example.nodejs.Retrofit.ITSHBackend;
import com.example.nodejs.Retrofit.RetrofitClient;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;

import java.util.ArrayList;
import java.util.HashMap;

import in.galaxyofandroid.spinerdialog.SpinnerDialog;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

public class CatalogueActivity extends AppCompatActivity implements MyRecycleViewAdapter.ItemClickListener {
    ITSHBackend myAPI;
    Gson gson = new GsonBuilder().setLenient().create();
    CompositeDisposable compositeDisposable = new CompositeDisposable();
    MyRecycleViewAdapter myRecycleViewAdapter;

    HashMap<String, Integer> siteHashMap = new HashMap<>();
    HashMap<String, Integer> categoryHashMap = new HashMap<>();

    public void addCatalogueJsonArrayToRecyclerView(RecyclerView recyclerView, JsonArray catalogueJsonArray) {
        myRecycleViewAdapter = new MyRecycleViewAdapter(CatalogueActivity.this, catalogueJsonArray);
        myRecycleViewAdapter.setClickListener(CatalogueActivity.this);
        recyclerView.setAdapter(myRecycleViewAdapter);
    }

    private void cancelUpdate() {
        Intent myIntent = new Intent(CatalogueActivity.this, DiscountCatalogueActivity.class);
        CatalogueActivity.this.startActivity(myIntent);
        finish();
    }

    private void startItemActivity(){
        Intent myIntent = new Intent(CatalogueActivity.this, CatalogueItemViewActivity.class);
        this.startActivity(myIntent);
    }

    private boolean isThereStoredCatalogue() {
        final SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(CatalogueActivity.this);
        final String userString = settings.getString("filterResult", "{}");

        return !userString.equals("{}");
    }

    @Override
    public void onItemClick(View view, int position) {
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(CatalogueActivity.this);
        CatalogueItem catalogueItem = myRecycleViewAdapter.getItem(position);
        settings.edit().putString("catalogueItem", gson.toJson(catalogueItem)).apply();
        startItemActivity();
    }


    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_catalogue);

        siteHashMap.put("SZEGED", 1);
        siteHashMap.put("PÉCS", 2);
        siteHashMap.put("DEBRECEN", 3);
        siteHashMap.put("BUDAPEST", 4);
        siteHashMap.put("COUNTRY WISE", 5);

        categoryHashMap.put("Étel/Ital", 1);
        categoryHashMap.put("Autó-Motor", 2);
        categoryHashMap.put("Egészség", 3);
        categoryHashMap.put("Fotó", 4);
        categoryHashMap.put("Szabadidő", 5);
        categoryHashMap.put("Szállás, Utazás", 6);
        categoryHashMap.put("Egyéb", 8);
        categoryHashMap.put("Sport", 9);
        categoryHashMap.put("Informatika", 10);
        categoryHashMap.put("Könyv", 11);
        categoryHashMap.put("Ruha", 12);
        categoryHashMap.put("Szépségápolás", 13);
        categoryHashMap.put("Színház, Mozi", 14);
        categoryHashMap.put("Sportegyesület", 15);
        categoryHashMap.put("Magánoktatás", 16);
        categoryHashMap.put("Rendezvényszervezés", 17);

        final ArrayList<String> siteList = new ArrayList<>(siteHashMap.keySet());
        final ArrayList<String> categoryList = new ArrayList<>(categoryHashMap.keySet());

        final RecyclerView recyclerView = findViewById(R.id.recyclerView);
        recyclerView.setLayoutManager(new LinearLayoutManager(this));

        final SpinnerDialog siteSpinnerDialog;
        final SpinnerDialog categorySpinnerDialog;

        Retrofit retrofit = RetrofitClient.getInstance();
        myAPI = retrofit.create(ITSHBackend.class);
        final SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(CatalogueActivity.this);

        siteSpinnerDialog = new SpinnerDialog(CatalogueActivity.this, siteList, getString(R.string.select_site));
        categorySpinnerDialog = new SpinnerDialog(CatalogueActivity.this, categoryList, getString(R.string.select_category));

        // Initialize GUI elements
        final ArrayList<TextView> filterTextArrayList = new ArrayList<>();
        filterTextArrayList.add(findViewById(R.id.filterTextView1));
        filterTextArrayList.add(findViewById(R.id.filterTextView2));
        filterTextArrayList.add(findViewById(R.id.filterTextView3));
        filterTextArrayList.add(findViewById(R.id.filterTextView4));
        filterTextArrayList.add(findViewById(R.id.filterTextView5));

        Button catalogueListButton = findViewById(R.id.updateListButton);
        final Button cancelCatalogue = findViewById(R.id.cancelCatalogueButton);
        final LinearLayout linearLayout = new LinearLayout(CatalogueActivity.this);

        // Set GUI element parameters
        linearLayout.setOrientation(LinearLayout.VERTICAL);
        linearLayout.setHorizontalGravity(LinearLayout.TEXT_ALIGNMENT_CENTER);
        linearLayout.getDividerDrawable();

        // Load stored catalogue if exists
        if (isThereStoredCatalogue()){
            JsonArray catalogueJsonArray = gson.fromJson(settings.getString("filterResult", "{}"), JsonArray.class);
            addCatalogueJsonArrayToRecyclerView(recyclerView, catalogueJsonArray);
        }

        // Remove filters
        for (final TextView filter: filterTextArrayList) {
            filter.setOnClickListener(v -> {
                filter.setVisibility(View.INVISIBLE);
                filter.setText("");
            });
        }

        Button siteDialogButton = findViewById(R.id.siteDialogButton);
        siteDialogButton.setOnClickListener(v -> siteSpinnerDialog.showSpinerDialog());

        Button categoryDialogButton = findViewById(R.id.catalogueDialogButton);
        categoryDialogButton.setOnClickListener(v -> {


            categorySpinnerDialog.showSpinerDialog();
        });

        siteSpinnerDialog.bindOnSpinerListener((item, position) -> {
            for (int i = 0; i < siteHashMap.size(); i++) {
                if (filterTextArrayList.get(i).getText().equals("") || filterTextArrayList.get(i).getText().equals(item)) {
                    filterTextArrayList.get(i).setVisibility(View.VISIBLE);
                    filterTextArrayList.get(i).setText(item);
                    break;
                }
            }
        });

        categorySpinnerDialog.bindOnSpinerListener((item, position) -> {
            for (int j = 0; j < siteHashMap.size(); j++) {
                if (filterTextArrayList.get(j).getText().equals("") || filterTextArrayList.get(j).getText().equals(item)) {
                    filterTextArrayList.get(j).setVisibility(View.VISIBLE);
                    filterTextArrayList.get(j).setText(item);
                    break;
                }
            }
        });

        cancelCatalogue.setOnClickListener(v -> cancelUpdate());

        catalogueListButton.setOnClickListener(v -> {
            final ArrayList<Integer> selectedSiteIds = new ArrayList<>();
            final ArrayList<Integer> selectedCategoryIds = new ArrayList<>();

            for (int i = 0; i < filterTextArrayList.size(); i++) {
                String text = filterTextArrayList.get(i).getText().toString();
                Integer siteId = siteHashMap.get(text);
                if (siteId != null) {
                    selectedSiteIds.add(siteId);
                }
            }

            for (int j = 0; j < filterTextArrayList.size(); j++) {
                Integer categoryId = categoryHashMap.get(filterTextArrayList.get(j).getText());
                if (categoryId != null) {
                    selectedCategoryIds.add(categoryId);
                }
            }
            String token = settings.getString("token", "");
            String bearerToken = getString(R.string.bearer_token) + " " + token;
            linearLayout.removeAllViews();

            compositeDisposable.add(myAPI.getCatalogueElementSearch(bearerToken, selectedSiteIds.toString(), selectedCategoryIds.toString())
                    .subscribeOn(Schedulers.io())
                    .observeOn(AndroidSchedulers.mainThread())
                    .subscribe(response -> {
                        if (response.code() >= 200 && response.code() < 300) {
                            JsonArray catalogueJsonArray = response.body().getAsJsonArray("filterResult");
                            User user = gson.fromJson(response.body().get("user"), User.class);
                            settings.edit().putString("filterResult", gson.toJson(catalogueJsonArray)).apply();
                            addCatalogueJsonArrayToRecyclerView(recyclerView, catalogueJsonArray);
                            Toast.makeText(CatalogueActivity.this, getString(R.string.catalogue_retrieve_successful), Toast.LENGTH_LONG).show();
                        } else {
                            Toast.makeText(CatalogueActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                        }
                    }));
        });
    }
}