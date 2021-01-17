import React, { useState, useEffect, useRef } from "react";
import { Text, View, Button, Platform, Alert, Linking } from "react-native";
import * as Notifications from "expo-notifications";
import * as IntentLauncher from "expo-intent-launcher";
import * as Application from "expo-application";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

async function getPermissionsForNotification() {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();

  if (existingStatus !== "granted") {
    const {
      status: finalStatus,
    } = await Notifications.requestPermissionsAsync();

    if (finalStatus !== "granted") {
      Alert.alert(
        "É preciso permitir o envio de notificações",
        "Vá para Configurações > BeeStudent > Notificações",
        [
          {
            text: "Cancelar",
            onPress: () => console.log("Cancel Pressed"),
            style: "cancel",
          },
          {
            text: "Configurações",
            onPress: () => {
              if (Platform.OS === "ios") {
                Linking.openURL(`app-settings:`);
              } else {
                const bundleIdentifier = Application.applicationId;
                IntentLauncher.startActivityAsync(
                  IntentLauncher.ACTION_APPLICATION_DETAILS_SETTINGS,
                  {
                    data: `package:${bundleIdentifier}`,
                  }
                );
              }
            },
          },
        ],
        { cancelable: false }
      );
      return;
    }
  }

  if (Platform.OS === "android") {
    Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#FF231F7C",
    });
  }
}

export default function App() {
  const [notification, setNotification] = useState(false);
  const notificationListener = useRef();
  const responseListener = useRef();

  useEffect(() => {
    getPermissionsForNotification();
    //arrumar
    Notifications.setBadgeCountAsync(0);

    notificationListener.current = Notifications.addNotificationReceivedListener(
      (notification) => {
        setNotification(notification);
      }
    );

    responseListener.current = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log(response);
      }
    );

    return () => {
      Notifications.removeNotificationSubscription(notificationListener);
      Notifications.removeNotificationSubscription(responseListener);
    };
  }, []);

  async function scheduleNotification() {
    let dateStudy = new Date().getTime();
    let dateSchedule = new Date().getTime();
    let op = "No dia";
    let trigger;

    if (op === "Antes") {
      trigger = (dateSchedule - 24 * 60 * 60 * 1000 - dateStudy) / 1000;
    }
    if (op === "No dia") {
      trigger = (dateSchedule + 1000 - dateStudy) / 1000;
    }

    Notifications.scheduleNotificationAsync({
      content: {
        title: "Remember to drink water!",
        body: "body",
        badge: parseInt((await Notifications.getBadgeCountAsync()) + 1),
        sound: true,
      },
      trigger: {
        seconds: parseInt(trigger),
        repeats: false,
      },
    });
  }

  return (
    <View
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "space-around",
      }}
    >
      <View style={{ alignItems: "center", justifyContent: "center" }}>
        <Text>
          Title: {notification && notification.request.content.title}{" "}
        </Text>
        <Text>Body: {notification && notification.request.content.body}</Text>
      </View>
      <Button
        title="Press to Send Notification"
        onPress={() => scheduleNotification()}
      />
    </View>
  );
}
