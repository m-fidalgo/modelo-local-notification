import React, { useEffect, useState } from "react";
import { View, Button, Platform, Alert, Linking } from "react-native";
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
  const revisionDate = new Date("2021-01-19");
  const op = "Antes";
  const subject = "Geografia";

  useEffect(() => {
    getPermissionsForNotification();
    //arrumar
    Notifications.setBadgeCountAsync(0);
  }, []);

  async function scheduleNotification(revisionDate, op, subject) {
    const currentDate = new Date();
    const scheduledDate = new Date();

    scheduledDate.setFullYear(revisionDate.getUTCFullYear());
    scheduledDate.setMonth(revisionDate.getUTCMonth());
    scheduledDate.setHours(10);
    scheduledDate.setMinutes(7);
    scheduledDate.setSeconds(0);
    scheduledDate.setMilliseconds(0);

    let message;

    if (op === "Antes") {
      scheduledDate.setDate(revisionDate.getUTCDate() - 1);
      message = [
        `Não se esqueça de revisar ${subject} amanhã!`,
        `Amanhã é dia de revisar ${subject}`,
        `${subject} aaaaaa`,
        `aaaaaaa ${subject}`,
        `aaaaaaaaaaaaaaaa`,
      ];
    }
    if (op === "No dia") {
      scheduledDate.setDate(revisionDate.getUTCDate());
      message = [
        `Hoje é dia de revisar ${subject}`,
        `${subject} está te esperando. Vamos revisar?`,
        `${subject} aaaaaa`,
        `aaaaaaa ${subject}`,
        `aaaaaaaaaaaaaaaa`,
      ];
    }

    const randomNumber = Math.floor(Math.random() * message.length);

    Notifications.scheduleNotificationAsync({
      content: {
        title: subject,
        body: message[randomNumber],
        badge: parseInt((await Notifications.getBadgeCountAsync()) + 1),
        sound: true,
      },
      trigger: {
        seconds:
          parseInt(scheduledDate.getTime() - currentDate.getTime()) / 1000,
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
      <Button
        title="Press to Send Notification"
        onPress={() => scheduleNotification(revisionDate, op, subject)}
      />
    </View>
  );
}
