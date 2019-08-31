package com.example.nodejs;

import android.content.Intent;
import android.content.SharedPreferences;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.support.v7.app.AppCompatActivity;
import android.widget.Button;
import android.widget.EditText;
import android.widget.Spinner;
import android.widget.Toast;
import com.example.nodejs.Retrofit.ITSHBackend;
import com.example.nodejs.Retrofit.RetrofitClient;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

public class UpdateActivity extends AppCompatActivity {

    ITSHBackend myAPI;
    Gson gson = new GsonBuilder().setLenient().create();
    CompositeDisposable compositeDisposable = new CompositeDisposable();

    private void cancelUpdate() {
        Intent myIntent = new Intent(UpdateActivity.this, LoginActivity.class);
        UpdateActivity.this.startActivity(myIntent);
        finish();
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_update);

        Retrofit retrofit = RetrofitClient.getInstance();
        myAPI = retrofit.create(ITSHBackend.class);

        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(UpdateActivity.this);
        final String token = settings.getString("token", "not found");
        final User user = gson.fromJson(settings.getString("user", "not found"), User.class);

        final EditText yourNameText = findViewById(R.id.updateNameEditText);
        final EditText yourEmailText = findViewById(R.id.updateEmailEditText);
        final EditText newPwText = findViewById(R.id.updatePasswordEditText);
        final EditText newPwAgainText = findViewById(R.id.updatePasswordAgainEditText);
        Spinner updateSiteSpinner = findViewById(R.id.updateSiteSpinner);

        Button updateButton = findViewById(R.id.updateButton);
        Button cancelUpdateButton = findViewById(R.id.cancelUpdateButton);

        yourNameText.setText(user.getName());
        yourEmailText.setText(user.getEmail());

        switch (Integer.parseInt(user.getDefault_site_id())) {
            case 1:
                updateSiteSpinner.setSelection(0);
                break;
            case 2:
                updateSiteSpinner.setSelection(1);
                break;
            case 3:
                updateSiteSpinner.setSelection(2);
                break;
            case 4:
                updateSiteSpinner.setSelection(3);
                break;
        }

        updateButton.setOnClickListener(v -> {
            String pw = newPwText.getText().toString();
            String pwAgain = newPwAgainText.getText().toString();

            if (pw.equals(pwAgain)){
                updateData(user, yourNameText.getText().toString(), yourEmailText.getText().toString(), pw, token);
            }
        });

        cancelUpdateButton.setOnClickListener(v -> cancelUpdate());
    }

    public void updateData(final User user, final String name, final String email, String password, String token){
        final String bearerToken = getString(R.string.bearer_token) + " " + token;
        final Spinner updateSiteSpinner = findViewById(R.id.updateSiteSpinner);

        compositeDisposable.add(myAPI.updateUser(bearerToken, name, email, password, updateSiteSpinner.getSelectedItem().toString())
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if(response.code() >= 200 && response.code() < 300) {
                        Toast.makeText(UpdateActivity.this, "User successfully updated" , Toast.LENGTH_LONG).show();
                        user.setName(name);
                        user.setEmail(email);

                        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(UpdateActivity.this);
                        settings.edit().putString("user", gson.toJson(user)).apply();
                        cancelUpdate();
                    } else {
                        Toast.makeText(UpdateActivity.this,  response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                    }
                }));
    }
}
