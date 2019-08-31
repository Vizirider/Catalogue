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
public class MenuViewTest {

    @Rule
    public ActivityTestRule<LoginActivity> activity_login =
            new ActivityTestRule<>(LoginActivity.class);

    @Test
    public void WelcomeText() {
        onView(withId(R.id.emailTextView))
                .check(matches(withText("Welcome onboard")));
    }

    @Test
    public void LogoutButton() {
        onView(withId(R.id.logoutButton))
                .check(matches(withText("Logout")));
    }

    @Test
    public void UpdateButton() {
        onView(withId(R.id.updateInfoButton))
                .check(matches(withText("Update Info")));
    }

    @Test
    public void CatalogueButton() {
        onView(withId(R.id.catalogueButton))
                .check(matches(withText("catalogue")));
    }

    @Test
    public void DeleteButton() {
        onView(withId(R.id.deleteButton))
                .check(matches(withText("Delete user")));
    }


}