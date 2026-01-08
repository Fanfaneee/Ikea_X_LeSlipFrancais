import React from 'react';
import { Dimensions, Image, StyleSheet, View } from 'react-native';

const { width } = Dimensions.get('window');

export default function HeroFooter() {
    return (
        <View style={styles.footerContainer}>
            <Image
                source={require('../assets/images/lkf_perso.png')}
                style={styles.heroImage}
                resizeMode="contain"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    footerContainer: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 20,
        marginTop: 20,
        backgroundColor: 'transparent',
    },
    heroImage: {
        width: 100,
        height: 100,
    },
});