import { View, StyleSheet, Image, Dimensions } from 'react-native';
import Svg, { Text, TextPath, Defs, Path } from 'react-native-svg';

export default function Hero() {
    const size = 240;
    const radius = 95; // Closer to logo (80 radius)
    const center = size / 2;

    return (
        <View style={styles.container}>
            <View style={styles.logoWrapper}>
                <Svg width={size} height={size} style={styles.svg}>
                    <Defs>
                        <Path
                            id="topPath"
                            d={`M ${center - radius}, ${center} A ${radius},${radius} 0 0,1 ${center + radius},${center}`}
                        />
                        <Path
                            id="bottomPath"
                            d={`M ${center - radius}, ${center} A ${radius},${radius} 0 0,0 ${center + radius},${center}`}
                        />
                    </Defs>

                    <Text fill="#002347" fontSize="13" fontWeight="900">
                        <TextPath
                            href="#topPath"
                            startOffset="50%"
                            textAnchor="middle"
                            textLength={Math.PI * radius * 0.8}
                        >
                            • الاسعاف • الانقاد • النجدة •
                        </TextPath>
                    </Text>

                    <Text fill="#002347" fontSize="13" fontWeight="900">
                        <TextPath
                            href="#bottomPath"
                            startOffset="50%"
                            textAnchor="middle"
                            textLength={Math.PI * radius * 0.8}
                        >
                            • ALLO حماية •
                        </TextPath>
                    </Text>
                </Svg>
                <Image
                    source={require('../civil.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logoWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        width: 190,
        height: 190,
    },
    svg: {
        position: 'absolute',
    },
    logo: {
        width: 180,
        height: 180,
        // Optional: subtle drop shadow for the logo itself
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
    },
});
