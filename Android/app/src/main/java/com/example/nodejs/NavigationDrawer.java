package com.example.nodejs;

import android.app.Activity;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.drawable.Drawable;
import android.net.Uri;
import android.preference.PreferenceManager;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.EditText;
import android.widget.Toast;

import com.example.nodejs.Retrofit.ITSHBackend;
import com.example.nodejs.Retrofit.RetrofitClient;
import com.github.javiersantos.materialstyleddialogs.MaterialStyledDialog;
import com.mikepenz.materialdrawer.AccountHeader;
import com.mikepenz.materialdrawer.AccountHeaderBuilder;
import com.mikepenz.materialdrawer.Drawer;
import com.mikepenz.materialdrawer.DrawerBuilder;
import com.mikepenz.materialdrawer.model.DividerDrawerItem;
import com.mikepenz.materialdrawer.model.PrimaryDrawerItem;
import com.mikepenz.materialdrawer.model.ProfileDrawerItem;
import com.mikepenz.materialdrawer.model.PrimaryDrawerItem;
import com.mikepenz.materialdrawer.model.SecondaryDrawerItem;

import java.io.File;

import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import retrofit2.Retrofit;

import static android.content.Context.MODE_PRIVATE;

class NavigationDrawer {

    private Activity callingActivity;
    private Drawable profilePic;
    private User user;
    private Drawer drawer;
    private String token;

    NavigationDrawer(Activity callingActivity, Drawable profilePic, User user, String token) {
        this.callingActivity = callingActivity;
        this.profilePic = profilePic;
        this.user = user;
        this.token = token;
    }

    private void startActivity(Class activityClass) {
        Intent myIntent = new Intent(callingActivity, activityClass);
        callingActivity.startActivityForResult(myIntent, 200);
    }

    private void removeUserData(){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(callingActivity);
        File file = new File(callingActivity.getApplicationContext().getDir(callingActivity.getResources().getString(R.string.app_name), MODE_PRIVATE), "profile_pic.jpg");

        settings.edit().remove("token").apply();
        settings.edit().remove("user").apply();
        settings.edit().remove("filterResult").apply();
        settings.edit().remove("locale").apply();
        settings.edit().remove("prev_locale").apply();
        file.delete();
    }

    private void logout() {
        Intent myIntent = new Intent(callingActivity, MainActivity.class);
        callingActivity.startActivity(myIntent);
        removeUserData();
        callingActivity.finish();
    }

    private void deleteUser(final String email, final String token){
        final View enter_name_view = LayoutInflater.from(callingActivity).inflate(R.layout.delete_user_layout, null);

        final String bearerToken = callingActivity.getString(R.string.bearer_token) + " " + token;

        Retrofit retrofit = RetrofitClient.getInstance();
        ITSHBackend myAPI = retrofit.create(ITSHBackend.class);
        CompositeDisposable compositeDisposable = new CompositeDisposable();

        new MaterialStyledDialog.Builder(callingActivity)
                .setTitle(R.string.enter_password)
                .setDescription(R.string.one_more_step)
                .setCustomView(enter_name_view)
                .setNegativeText(R.string.cancel)
                .onNegative((dialog, which) -> {
                    dialog.dismiss();
                })
                .setPositiveText(R.string.delete)
                .onPositive((dialog, which) -> {
                    EditText deletePwText = enter_name_view.findViewById(R.id.deletePwText);
                    compositeDisposable.add(myAPI.deleteUser(bearerToken, email, deletePwText.getText().toString())
                            .subscribeOn(Schedulers.io())
                            .observeOn(AndroidSchedulers.mainThread())
                            .subscribe(response -> {
                                if (response.code() >= 200 && response.code() < 300) {
                                    Toast.makeText(callingActivity, callingActivity.getString(R.string.deletion_successful), Toast.LENGTH_LONG).show();
                                    logout();
                                } else {
                                    Toast.makeText(callingActivity, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                                }
                            }));
                }).show();
    }

    Drawer createNavigationDrawer() {
        // Create the AccountHeader
        AccountHeader headerResult = new AccountHeaderBuilder()
                .withActivity(callingActivity)
                .addProfiles(
                        new ProfileDrawerItem().withName(user.getName()).withEmail(user.getEmail()).withIcon(profilePic)
                )
                .withOnAccountHeaderListener((view, profile, currentProfile) -> {
                    // open upload dialog here
                    startActivity(SetProfilePictureActivity.class);
                    return false;
                })
                .build();

        //create the drawer and remember the `Drawer` drawer object
        drawer = new DrawerBuilder()
                .withActivity(callingActivity)
                .withAccountHeader(headerResult)
                .addDrawerItems(
                        new PrimaryDrawerItem().withIdentifier(1).withName(R.string.main_menu),
                        new DividerDrawerItem(),
                        new PrimaryDrawerItem().withIdentifier(2).withName(R.string.discount_catalogue)
                )
                .withOnDrawerItemClickListener((view, position, drawerItem) -> {
                    // do something with the clicked item
                    switch ((int) drawerItem.getIdentifier()){
                        case 1:
                            if (callingActivity.getLocalClassName().equals("LoginActivity")){
                                drawer.setSelection(-1);
                                break;
                            } else {
                                callingActivity.finish();
                                break;
                            }
                        case 2:
                            if (callingActivity.getLocalClassName().equals("DiscountCatalogueActivity")){
                                drawer.setSelection(-1);
                                break;
                            } else {
                                startActivity(DiscountCatalogueActivity.class);
                                drawer.closeDrawer();
                                break;
                            }

                        case 3:
                            startActivity(UpdateActivity.class);
                            drawer.closeDrawer();
                            break;
                        case 4:
                            deleteUser(user.getEmail(), token);
                            break;

                        case 5:
                            logout();
                            break;
                    }

                    return true;
                })
                .withSelectedItem(-1)
                .build();

        SecondaryDrawerItem updateUserDrawerItem = new SecondaryDrawerItem().withIdentifier(3).withName(callingActivity.getString(R.string.update_info));
        drawer.addStickyFooterItem(updateUserDrawerItem);

        SecondaryDrawerItem deleteUserDrawerItem = new SecondaryDrawerItem().withIdentifier(4).withName(callingActivity.getString(R.string.delete_user));
        drawer.addStickyFooterItem(deleteUserDrawerItem);

        drawer.addStickyFooterItem(new DividerDrawerItem());

        SecondaryDrawerItem logoutDrawerItem = new SecondaryDrawerItem().withIdentifier(5).withName(callingActivity.getString(R.string.logout));
        drawer.addStickyFooterItem(logoutDrawerItem);

        return drawer;
    }
}
