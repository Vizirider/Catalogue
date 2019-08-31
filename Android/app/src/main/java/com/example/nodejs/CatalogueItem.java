package com.example.nodejs;

import android.os.Parcel;
import android.os.Parcelable;

public class CatalogueItem implements Parcelable  {
    @Override
    public int describeContents() {
        return 0;
    }

    @Override
    public void writeToParcel(Parcel dest, int flags) {
        dest.writeString(seller);
        dest.writeString(category_id);
        dest.writeString(site_id);
        dest.writeString(address);
        dest.writeString(discount_rate);
        dest.writeString(valid_from);
        dest.writeString(valid_till);
        dest.writeInt(active ? 1 : 0);
        dest.writeString(description);
    }

    private CatalogueItem(Parcel in) {
        seller = in.readString();
        category_id = in.readString();
        site_id = in.readString();
        address = in.readString();
        discount_rate = in.readString();
        valid_from = in.readString();
        valid_till = in.readString();
        active = in.readInt() == 1;
        description = in.readString();

    }
    public static final Parcelable.Creator<CatalogueItem> CREATOR = new Parcelable.Creator<CatalogueItem>() {
        public CatalogueItem createFromParcel(Parcel in) {
            return new CatalogueItem(in);
        }

        public CatalogueItem[] newArray(int size) {
            return new CatalogueItem[size];
        }
    };

    private String seller;
    private String category_id;
    private String site_id;
    private String address;
    private String discount_rate;
    private String valid_from;
    private String valid_till;
    private Boolean active;
    private String description;

    public String getSeller() {
        return seller;
    }

    public void setSeller(String seller) {
        this.seller = seller;
    }

    public String getCategory_id() {
        return category_id;
    }

    public void setCategory_id(String category_id) {
        this.category_id = category_id;
    }

    public String getSite_id() {
        return site_id;
    }

    public void setSite_id(String site_id) {
        this.site_id = site_id;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public String getDiscount_rate() {
        return discount_rate;
    }

    public void setDiscount_rate(String discount_rate) {
        this.discount_rate = discount_rate;
    }

    public String getValid_from() {
        return valid_from;
    }

    public void setValid_from(String valid_from) {
        this.valid_from = valid_from;
    }

    public String getValid_till() {
        return valid_till;
    }

    public void setValid_till(String valid_till) {
        this.valid_till = valid_till;
    }

    public Boolean getActive() {
        return active;
    }

    public void setActive(boolean active) {
        this.active = active;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

