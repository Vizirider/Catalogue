package com.example.nodejs;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import androidx.test.runner.AndroidJUnit4;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;

@RunWith(AndroidJUnit4.class)
@LargeTest

public class UpdateViewTest {

    @Rule
    public ActivityTestRule<MainActivity> activity_update =
            new ActivityTestRule<>(MainActivity.class);


    @Test
    public void NamedLabel() {
        onView(withId(R.id.updateNameTextView))
                .check(matches(withText("your_current_name")));
    }

    @Test
    public void NameText() {
        onView(withId(R.id.updateNameEditText))
                .check(matches(withText("")));
    }

    @Test
    public void EmailLabel() {
        onView(withId(R.id.updateEmailTextView))
                .check(matches(withText("your_current_e_mail")));
    }

    @Test
    public void EmailText() {
        onView(withId(R.id.updateEmailEditText))
                .check(matches(withText("")));
    }
}
