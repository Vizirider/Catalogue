package com.example.nodejs;

import android.content.Context;
import android.support.v7.widget.RecyclerView;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.TextView;
import com.google.gson.Gson;
import com.google.gson.GsonBuilder;
import com.google.gson.JsonArray;

public class MyRecycleViewAdapter extends RecyclerView.Adapter<MyRecycleViewAdapter.ViewHolder> {
    private JsonArray mData;
    private LayoutInflater mInflater;
    private ItemClickListener mClickListener;
    Gson gson = new GsonBuilder().setLenient().create();

    // Data is passed into the constructor
    MyRecycleViewAdapter(Context context, JsonArray data){
        this.mInflater = LayoutInflater.from(context);
        this.mData = data;
    }

    // Inflates the row layout from 'xml' when needed
    @Override
    public ViewHolder onCreateViewHolder(ViewGroup parent, int viewType) {
        View view = mInflater.inflate(R.layout.card_layout, parent, false);
        return new ViewHolder(view);
    }

    // Binds the data to the 'TextView' in each row
    @Override
    public void onBindViewHolder(ViewHolder holder, int i) {
        CatalogueItem catalogueItemElement = gson.fromJson(mData.get(i), CatalogueItem.class);
        String catalogueItemSeller = catalogueItemElement.getSeller();
        String catalogueItemAddress = catalogueItemElement.getAddress();
        String catalogueItemDiscount = catalogueItemElement.getDiscount_rate();
        holder.catalogueItemName.setText(catalogueItemSeller);
        holder.catalogueItemAddress.setText(catalogueItemAddress);
        holder.catalogueItemDiscount.setText(catalogueItemDiscount);
    }

    // Total number of rows
    @Override
    public int getItemCount() {
        System.out.print(mData);
        if (mData != null) {
            return mData.size();
        }
        return 0;
    }

    // Stores and recycles views as they are scrolled off screen
    public class ViewHolder extends RecyclerView.ViewHolder implements View.OnClickListener{
        TextView catalogueItemName;
        TextView catalogueItemAddress;
        TextView catalogueItemDiscount;

        ViewHolder(View itemView) {
            super(itemView);
            catalogueItemName = itemView.findViewById(R.id.cardNameView);
            catalogueItemAddress = itemView.findViewById(R.id.cardAddressView);
            catalogueItemDiscount = itemView.findViewById(R.id.cardDiscountView);
            itemView.setOnClickListener(this);
        }

        @Override
        public void onClick(View view) {
            if (mClickListener != null) mClickListener.onItemClick(view, getAdapterPosition());
        }
    }

    // Convenience method for getting data at click position
    CatalogueItem getItem(int id) {
        CatalogueItem catalogueItemElement = gson.fromJson(mData.get(id), CatalogueItem.class);
        return catalogueItemElement;
    }

    // Parent activity will implement this method to respond to click events
    public interface ItemClickListener{
        void onItemClick(View view, int position);
    }

    // Allows clicks events to be caught
    void setClickListener(ItemClickListener itemClickListener){
        this.mClickListener = itemClickListener;
    }
}
