package com.example.nodejs;

import org.junit.Rule;
import org.junit.Test;
import org.junit.runner.RunWith;

import androidx.test.filters.LargeTest;
import androidx.test.rule.ActivityTestRule;
import androidx.test.runner.AndroidJUnit4;

import static androidx.test.espresso.Espresso.onView;
import static androidx.test.espresso.action.ViewActions.click;
import static androidx.test.espresso.action.ViewActions.typeText;
import static androidx.test.espresso.assertion.ViewAssertions.matches;
import static androidx.test.espresso.matcher.ViewMatchers.withId;
import static androidx.test.espresso.matcher.ViewMatchers.withText;

@RunWith(AndroidJUnit4.class)
@LargeTest
public class LoginViewTest{

    @Rule
    public ActivityTestRule<MainActivity> activity_main =
            new ActivityTestRule<>(MainActivity.class);

    @Test
    public void LoginButton() {
        onView(withId(R.id.loginButton))
                .check(matches(withText("Login")));
    }

    @Test
    public void RegisterButton() {
        onView(withId(R.id.regButton))
                .check(matches(withText("Register")));
    }

    @Test
    public void EmailText() {
        onView(withId(R.id.emailEditText))
                .check(matches(withText("")));
    }

    @Test
    public void PasswordText() {
        onView(withId(R.id.passwordEditText))
                .check(matches(withText("")));
    }

    @Test
    public void ITSH() {
        onView(withId(R.id.catalogueTextView))
                .check(matches(withText("ITSH")));
    }

    @Test
    public void EmailLabel() {
        onView(withId(R.id.emailTextView))
                .check(matches(withText("e-mail:")));
    }

    @Test
    public void PasswordLabel() {
        onView(withId(R.id.passwordTextView))
                .check(matches(withText("password:")));
    }

    @Test
    public void LoginTestUser() {
        onView(withId(R.id.emailEditText)).perform(typeText("johndoe@hobby.local"));
        onView(withId(R.id.passwordEditText)).perform(typeText("1234"));
        onView(withId(R.id.loginButton)).perform(click());



    }

}