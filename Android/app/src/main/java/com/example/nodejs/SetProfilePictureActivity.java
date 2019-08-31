package com.example.nodejs;

import android.Manifest;
import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.PackageManager;
import android.database.Cursor;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.preference.PreferenceManager;
import android.provider.MediaStore;
import android.support.annotation.NonNull;
import android.support.annotation.Nullable;
import android.support.v7.app.AppCompatActivity;
import android.webkit.MimeTypeMap;
import android.widget.Button;
import android.widget.ImageView;
import android.widget.Toast;

import com.example.nodejs.Retrofit.ITSHBackend;
import com.example.nodejs.Retrofit.RetrofitClient;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileNotFoundException;
import java.io.FileOutputStream;
import java.io.IOException;

import de.hdodenhof.circleimageview.CircleImageView;
import io.reactivex.android.schedulers.AndroidSchedulers;
import io.reactivex.disposables.CompositeDisposable;
import io.reactivex.schedulers.Schedulers;
import okhttp3.MediaType;
import okhttp3.RequestBody;
import retrofit2.Retrofit;

public class SetProfilePictureActivity extends AppCompatActivity {
    private static final int CAMERA_REQUEST = 1888;
    private static final int FILE_BROWSE_REQUEST = 200;
    private static final int MY_CAMERA_PERMISSION_CODE = 100;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_set_profile_picture);

        CircleImageView profilePictureImageView = findViewById(R.id.profilePictureImageView);
        ImageView removeImageView = findViewById(R.id.removeImageView);
        Button browsePhotoButton = findViewById(R.id.browsePhotoButton);
        Button cameraPhotoButton = findViewById(R.id.cameraPhotoButton);
        Button cancelPictureUpdateButton = findViewById(R.id.cancelPictureUpdateButton);

        profilePictureImageView.setImageBitmap(loadImageFromStorage(getApplicationContext()));

        removeImageView.setOnClickListener(v -> {
            removeProfilePicture();
            profilePictureImageView.setImageBitmap(BitmapFactory.decodeResource(this.getResources(), R.drawable.empty_profile));
            new File(getApplicationContext().getDir(getResources().getString(R.string.app_name), MODE_PRIVATE), "profile_pic.jpg").delete();
        });

        browsePhotoButton.setOnClickListener(v -> {
            Intent intent = new Intent();
            intent.setAction(Intent.ACTION_GET_CONTENT);
            intent.setType("file/*");
            startActivityForResult(intent, 200);
        });

        cameraPhotoButton.setOnClickListener(v -> {
                if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && checkSelfPermission(Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
                    requestPermissions(new String[]{Manifest.permission.CAMERA}, MY_CAMERA_PERMISSION_CODE);
                }
                else {
                    Intent cameraIntent = new Intent(MediaStore.ACTION_IMAGE_CAPTURE);
                    startActivityForResult(cameraIntent, CAMERA_REQUEST);
                }
        });

        cancelPictureUpdateButton.setOnClickListener(v -> {
            finish();
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, @Nullable Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(SetProfilePictureActivity.this);
        String token = settings.getString("token", "");
        String bearerToken = getString(R.string.bearer_token) + " " + token;

        CircleImageView profilePictureImageView = findViewById(R.id.profilePictureImageView);
        File profilePicFile = new File(this.getCacheDir(), "cameraPhoto.jpg");

        try {
            profilePicFile.createNewFile();
        } catch (IOException e) {
            e.printStackTrace();
        }

        if (requestCode == FILE_BROWSE_REQUEST && resultCode == Activity.RESULT_OK) {
            profilePicFile = new File(getRealPathFromURI(this, data.getData()));
        } else if (requestCode == CAMERA_REQUEST && resultCode == Activity.RESULT_OK) {
            Bitmap photo = (Bitmap) data.getExtras().get("data");
            //Convert bitmap to byte array
            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            photo.compress(Bitmap.CompressFormat.JPEG, 100 /*ignored for PNG*/, bos);
            byte[] photoData = bos.toByteArray();

            //write the bytes in file
            try {
                FileOutputStream fos = new FileOutputStream(profilePicFile);
                fos.write(photoData);
                fos.flush();
                fos.close();
            } catch (Exception e) {
                e.printStackTrace();
            }
        }

        Bitmap profilePicBitmap;

        if (resultCode == Activity.RESULT_OK) {
            try {
                profilePicBitmap = BitmapFactory.decodeStream(new FileInputStream(profilePicFile));
                saveToInternalStorage(profilePicBitmap);
                uploadProfilePic(bearerToken, profilePicFile);
                profilePictureImageView.setImageBitmap(cropToSquare(profilePicBitmap));
            } catch (FileNotFoundException e) {
                e.printStackTrace();
            }
        }
    }

    @Override
    public void onRequestPermissionsResult ( int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        if (requestCode == MY_CAMERA_PERMISSION_CODE) {
            if (grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                Toast.makeText(this, "camera permission granted", Toast.LENGTH_LONG).show();
                Intent cameraIntent = new Intent(android.provider.MediaStore.ACTION_IMAGE_CAPTURE);
                startActivityForResult(cameraIntent, CAMERA_REQUEST);
            } else {
                Toast.makeText(this, "camera permission denied", Toast.LENGTH_LONG).show();
            }
        }
    }


    public String getRealPathFromURI(Context context, Uri contentUri) {
        Cursor cursor = null;
        try {
            String[] proj = { MediaStore.Images.Media.DATA };
            cursor = context.getContentResolver().query(contentUri,  proj, null, null, null);
            int column_index = cursor.getColumnIndexOrThrow(MediaStore.Images.Media.DATA);
            cursor.moveToFirst();
            return cursor.getString(column_index);
        } finally {
            if (cursor != null) {
                cursor.close();
            }
        }
    }

    private Bitmap loadImageFromStorage(Context context) {
        Bitmap profilePicBitmap = BitmapFactory.decodeResource(this.getResources(), R.drawable.empty_profile);

        try {
            File f=new File(context.getDir(getResources().getString(R.string.app_name), MODE_PRIVATE), "profile_pic.jpg");
            profilePicBitmap = BitmapFactory.decodeStream(new FileInputStream(f));
        }
        catch (FileNotFoundException e)
        {
            e.printStackTrace();
        }
        return profilePicBitmap;
    }

    public Bitmap cropToSquare(Bitmap bitmap){
        int width  = bitmap.getWidth();
        int height = bitmap.getHeight();
        int newWidth = (height > width) ? width : height;
        int newHeight = (height > width)? height - ( height - width) : height;
        int cropW = (width - height) / 2;
        cropW = (cropW < 0)? 0: cropW;
        int cropH = (height - width) / 2;
        cropH = (cropH < 0)? 0: cropH;

        return Bitmap.createBitmap(bitmap, cropW, cropH, newWidth, newHeight);
    }

    private void saveToInternalStorage(Bitmap bitmapImage){
        File directory = getApplicationContext().getDir(getResources().getString(R.string.app_name), MODE_PRIVATE);

        File myPath =new File(directory,"profile_pic.jpg");

        FileOutputStream fileOutputStream = null;
        try {
            fileOutputStream = new FileOutputStream(myPath);
            // Use the compress method on the BitMap object to write image to the OutputStream
            Bitmap croppedBitmapImage = cropToSquare(bitmapImage);
            croppedBitmapImage.compress(Bitmap.CompressFormat.PNG, 100, fileOutputStream);
        } catch (Exception e) {
            e.printStackTrace();
        } finally {
            try {
                fileOutputStream.close();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
    }

    private void uploadProfilePic(String token, File profilePic) {
        Retrofit retrofit = RetrofitClient.getInstance();
        ITSHBackend myAPI = retrofit.create(ITSHBackend.class);
        CompositeDisposable compositeDisposable = new CompositeDisposable();

        RequestBody profilePicToSend = RequestBody.create(MediaType.parse(getMimeType(profilePic.getPath())), profilePic);

        compositeDisposable.add(myAPI.uploadProfilePicture(token, profilePicToSend)
                .subscribeOn(Schedulers.io())
                .observeOn(AndroidSchedulers.mainThread())
                .subscribe(response -> {
                    if (response.code() >= 200 && response.code() < 300) {
                        Toast.makeText(SetProfilePictureActivity.this, response.code() + " " + response.body().string(), Toast.LENGTH_LONG).show();
                    } else {
                        Toast.makeText(SetProfilePictureActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                    }
                }));
    }

    private void removeProfilePicture(){
        SharedPreferences settings = PreferenceManager.getDefaultSharedPreferences(SetProfilePictureActivity.this);
        String bearerToken = getString(R.string.bearer_token) + " " + settings.getString("token", "");

        Retrofit retrofit = RetrofitClient.getInstance();
        ITSHBackend myAPI = retrofit.create(ITSHBackend.class);
        CompositeDisposable compositeDisposable = new CompositeDisposable();

        compositeDisposable.add(myAPI.removeProfilePicture(bearerToken)
            .subscribeOn(Schedulers.io())
            .observeOn(AndroidSchedulers.mainThread())
            .subscribe(response -> {
                if (response.code() >= 200 && response.code() < 300) {
                    Toast.makeText(SetProfilePictureActivity.this, response.code() + " " + response.body().string(), Toast.LENGTH_LONG).show();
                } else {
                    Toast.makeText(SetProfilePictureActivity.this, response.code() + " " + response.errorBody().string(), Toast.LENGTH_LONG).show();
                }
            }));
    }

    public static String getMimeType(String url) {
        String type = null;
        String extension = MimeTypeMap.getFileExtensionFromUrl(url);
        if (extension != null) {
            type = MimeTypeMap.getSingleton().getMimeTypeFromExtension(extension);
        }
        return type;
    }
}
