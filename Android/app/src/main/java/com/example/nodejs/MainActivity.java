package com.example.nodejs;

import android.content.Intent;
import android.content.SharedPreferences;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.AdapterView;
import android.widget.Button;
import android.widget.EditText;
import android.widget.ProgressBar;
import android.widget.Spinner;
import android.widget.TextView;
import android.widget.Toast;
import com.example.nodejs.Retrofit.ITSHBackend;
import com.example.nodejs.Retrofit.RetrofitClient;
import com.github.javiersantos.materialstyleddialogs.MaterialStyledDialog;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import java.util.Locale;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

public class MainActivity extends AppCompatActivity {

    ITSHBackend myAPI;
    Retrofit retrofit = RetrofitClient.getInstance();
    Gson gson = new GsonBuilder().setLenient().create();
    CompositeDisposable compositeDisposable = new CompositeDisposable();

    @Override
    protected void onStop(){
        compositeDisposable.clear();
        super.onStop();
    }

    @Override
    protected void onDestroy() {
        compositeDisposable.clear();
        super.onDestroy();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        myAPI = retrofit.create(ITSHBackend.class);

        Button loginButton = findViewById(R.id.loginButton);
        Button regButton = findViewById(R.id.regButton);

        final Spinner localeSpinner = findViewById(R.id.localeSpinner);
        final EditText emailEditText = findViewById(R.id.emailEditText);
        final EditText passwordEditText = findViewById(R.id.passwordEditText);
        final TextView forgotPasswordTextView = findViewById(R.id.forgotPasswordTextView);

        if (isTokenUserStored()) {
            startLoginActivity();
        }

        loginButton.setOnClickListener(v -> {
            if (isFieldsFilled(emailEditText, passwordEditText))
                loginUser(emailEditText.getText().toString(), passwordEditText.getText().toString());
        });

        regButton.setOnClickListener(v -> {
            if (isFieldsFilled(emailEditText, passwordEditText))
                registerUser(emailEditText.getText().toString(), passwordEditText.getText().toString());
        });

        localeSpinner.setOnItemSelectedListener(new AdapterView.OnItemSelectedListener() {
            @Override
            public void onItemSelected(AdapterView<?> parent, View view, int position, long id) {
                if (!getResources().getConfiguration().locale.getLanguage().toLowerCase().equals(localeSpinner.getSelectedItem().toString().toLowerCase())) {
                    setLocale(localeSpinner.getSelectedItem().toString().toLowerCase());
                    recreate();
                }
            }

            @Override
            public void onNothingSelected(AdapterView<?> parent) {

            }
        });

        forgotPasswordTextView.setOnClickListener(v -> {
            resetPassword(emailEditText.getText().toString());
        });
    }

    @Override
    protected void onStart() {
        super.onStart();
        Spinner localeSpinner = findViewById(R.id.localeSpinner);
        String currentLocale = getResources().getConfiguration().locale.getLanguage().toLowerCase();
        if (!currentLocale.equals("hu")) {
            localeSpinner.setSelection(1);
        }
    }

    private void loginUser(final String email, final String password){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(MainActivity.this);

        findViewById(R.id.loginButton).setEnabled(false);
        findViewById(R.id.loginButton).setVisibility(View.INVISIBLE);
        findViewById(R.id.regButton).setEnabled(false);
        findViewById(R.id.regButton).setVisibility(View.INVISIBLE);
        findViewById(R.id.progressBar).setVisibility(View.VISIBLE);


        compositeDisposable.add(myAPI.loginUser(email, password)
        .subscribeOn(Schedulers.io())
        .observeOn(AndroidSchedulers.mainThread())
        .subscribe(response -> {
            if (response.code() >= 200 && response.code() < 300) {
                String token = response.body().get("token").getAsString();
                User user = gson.fromJson(response.body().get("user"), User.class);

                if (user.getIs_active() == 1 && user.getIs_deleted() == 0) {
                    settings.edit().putString("token", token).apply();
                    settings.edit().putString("user", gson.toJson(user)).apply();
                    startLoginActivity();
                }else if (user.getIs_active() == 0){
                    Toast.makeText(MainActivity.this, "You're account hasn't been activated!", Toast.LENGTH_SHORT).show();
                    findViewById(R.id.progressBar).setVisibility(View.INVISIBLE);
                    findViewById(R.id.loginButton).setEnabled(true);
                    findViewById(R.id.loginButton).setVisibility(View.VISIBLE);
                    findViewById(R.id.regButton).setEnabled(true);
                    findViewById(R.id.regButton).setVisibility(View.VISIBLE);
                }else{
                    Toast.makeText(MainActivity.this, "You're account has been deleted!", Toast.LENGTH_SHORT).show();
                    findViewById(R.id.progressBar).setVisibility(View.INVISIBLE);
                    findViewById(R.id.loginButton).setEnabled(true);
                    findViewById(R.id.loginButton).setVisibility(View.VISIBLE);
                    findViewById(R.id.regButton).setEnabled(true);
                    findViewById(R.id.regButton).setVisibility(View.VISIBLE);
                }
            } else {
                Toast.makeText(MainActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                findViewById(R.id.progressBar).setVisibility(View.INVISIBLE);
                findViewById(R.id.loginButton).setEnabled(true);
                findViewById(R.id.loginButton).setVisibility(View.VISIBLE);
                findViewById(R.id.regButton).setEnabled(true);
                findViewById(R.id.regButton).setVisibility(View.VISIBLE);
            }
        }));
    }

    private void registerUser(final String email, final String password){

        final View enter_name_view = LayoutInflater.from(this).inflate(R.layout.enter_name_layout, null);
        final View enter_site_view = LayoutInflater.from(this).inflate(R.layout.enter_name_layout, null);
        new MaterialStyledDialog.Builder(this)
                .setTitle(R.string.register)
                .setDescription(R.string.write_name_site)
                .setCustomView(enter_name_view)
                .setNegativeText(R.string.cancel)
                .onNegative((dialog, which) -> dialog.dismiss())
                .setPositiveText(R.string.register)
                .onPositive((dialog, which) -> {
                    EditText nameText = enter_name_view.findViewById(R.id.nameText);
                    Spinner registrationSiteSpinner = enter_site_view.findViewById(R.id.registrationSiteSpinner);

                    if (nameText.getText().toString().equals("")) {
                        Toast.makeText(MainActivity.this, getString(R.string.name_cannot_empty), Toast.LENGTH_LONG).show();
                    }
                    else if (registrationSiteSpinner.getSelectedItem().toString().equals("")) {
                        Toast.makeText(MainActivity.this, getString(R.string.site_cannot_empty), Toast.LENGTH_LONG).show();
                    }
                    else{
                        compositeDisposable.add(myAPI.registerUser(email, nameText.getText().toString(), password, registrationSiteSpinner.getSelectedItem().toString())
                                .subscribeOn(Schedulers.io())
                                .observeOn(AndroidSchedulers.mainThread())
                                .subscribe(response -> {
                                    if (response.code() >= 200 && response.code() < 300) {
                                        Toast.makeText(MainActivity.this, getString(R.string.registration_successful), Toast.LENGTH_SHORT).show();
                                    } else {
                                        Toast.makeText(MainActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_SHORT).show();
                                    }
                                }));
                    }
                }).show();
    }

    private void startLoginActivity(){
        Intent myIntent = new Intent(MainActivity.this, LoginActivity.class);
        MainActivity.this.startActivity(myIntent);
        finish();
    }

    private boolean isFieldsFilled(EditText editText1, EditText editText2){
        if (editText1.getText().toString().equals("") || editText2.getText().toString().equals("")) {
            Toast.makeText(MainActivity.this, "Fields cannot be empty!", Toast.LENGTH_LONG).show();
            return false;
        } else {
            return true;
        }
    }

    private boolean isTokenUserStored(){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(MainActivity.this);
        final String token = settings.getString("token", "not found");
        final String userString = settings.getString("token", "not found");

        return !token.equals("not found") || !userString.equals("not found");
    }

    public void setLocale(String lang){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(MainActivity.this);
        settings.edit().putString("locale", lang).apply();
        Locale myLocale = new Locale(lang);
        Configuration config = new Configuration();
        config.locale = myLocale;
        Resources resources = getResources();
        resources.updateConfiguration(config, resources.getDisplayMetrics());
    }

    public void resetPassword(String email){
        compositeDisposable.add(myAPI.resetPassword(email)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(response -> {
                if (response.code() >= 200 && response.code() < 300) {
                    Toast.makeText(MainActivity.this, getString(R.string.password_reset_email_sent), Toast.LENGTH_SHORT).show();
                } else {
                    Toast.makeText(MainActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_SHORT).show();
                }
            }));
    }
}
