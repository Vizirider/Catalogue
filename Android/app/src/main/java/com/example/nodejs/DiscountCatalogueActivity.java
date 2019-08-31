package com.example.nodejs;

import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.graphics.drawable.BitmapDrawable;
import android.graphics.drawable.Drawable;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.widget.Button;
import android.widget.ImageView;

import com.example.nodejs.Retrofit.ITSHBackend;
import com.example.nodejs.Retrofit.RetrofitClient;
import com.google.android.gms.maps.GoogleMap;
import com.google.android.gms.maps.OnMapReadyCallback;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.mikepenz.materialdrawer.AccountHeader;
import com.mikepenz.materialdrawer.AccountHeaderBuilder;
import com.mikepenz.materialdrawer.Drawer;
import com.mikepenz.materialdrawer.DrawerBuilder;
import com.mikepenz.materialdrawer.model.DividerDrawerItem;
import com.mikepenz.materialdrawer.model.PrimaryDrawerItem;
import com.mikepenz.materialdrawer.model.ProfileDrawerItem;
import com.mikepenz.materialdrawer.model.SecondaryDrawerItem;

import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;

import retrofit2.Retrofit;

public class DiscountCatalogueActivity extends AppCompatActivity {

    Gson gson = new GsonBuilder().setLenient().create();
    Bitmap profilePicBitmap = null;

    private void startCatalogueActivity(){
        Intent myIntent = new Intent(DiscountCatalogueActivity.this, CatalogueActivity.class);
        DiscountCatalogueActivity.this.startActivity(myIntent);
        finish();
    }

    private void startCatalogueAddActivity(){
        Intent myIntent = new Intent(DiscountCatalogueActivity.this, CatalogueAddActivity.class);
        DiscountCatalogueActivity.this.startActivity(myIntent);
        finish();
    }
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_discount_catalogue);

        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(DiscountCatalogueActivity.this);
        final User user = gson.fromJson(settings.getString("user","{}"), User.class);
        final String token = settings.getString("token","{}");

        profilePicBitmap = BitmapFactory.decodeResource(this.getResources(), R.drawable.empty_profile);
        loadImageFromStorage(getApplicationContext());
        Drawable profilePic = new BitmapDrawable(getResources(), profilePicBitmap);

        Drawer drawer = new NavigationDrawer(this, profilePic, user, token).createNavigationDrawer();

        Button catalogueButton = findViewById(R.id.catalogueButton);
        Button newCatalogueButton = findViewById(R.id.newCatalogueButton);
        ImageView hamburgerImageView = findViewById(R.id.hamburgerImageView);

        hamburgerImageView.setOnClickListener(v -> drawer.openDrawer());

        catalogueButton.setOnClickListener(v -> startCatalogueActivity());

        newCatalogueButton.setOnClickListener(v -> startCatalogueAddActivity());
    }

    @Override
    protected void onResume() {
        super.onResume();
    }

    private void loadImageFromStorage(Context context) {
        try {
            File file = new File(context.getDir(getResources().getString(R.string.app_name), MODE_PRIVATE), "profile_pic.jpg");
            profilePicBitmap = BitmapFactory.decodeStream(new FileInputStream(file));
        }
        catch (FileNotFoundException e)
        {
            e.printStackTrace();
        }
    }
}