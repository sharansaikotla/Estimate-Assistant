import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  TextInput,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { InputField } from '../components/InputField';
import {
  LengthUnit,
  ROLL_WIDTH_UNITS,
  WALL_DIMENSION_UNITS,
  DEFAULT_ROLL_WIDTH_UNIT,
  DEFAULT_WALL_DIMENSION_UNIT,
} from '../constants/units';
import { calculateWallCovering, WallCoveringInputs, convertToFeet, convertFromFeet, formatNumber } from '../utils/wallCoveringCalc';

type RootStackParamList = {
  Home: undefined;
  WallCovering: undefined;
  ComingSoon: { category: string };
};

type WallCoveringScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WallCovering'>;
};

export const WallCoveringScreen: React.FC<WallCoveringScreenProps> = ({ navigation }) => {
  // Input states
  const [rollWidth, setRollWidth] = useState<string>('');
  const [rollWidthUnit, setRollWidthUnit] = useState<LengthUnit>(DEFAULT_ROLL_WIDTH_UNIT);

  const [rollSize, setRollSize] = useState<string>('');
  const [rollSizeUnit, setRollSizeUnit] = useState<LengthUnit>('yards');

  const [wallLength, setWallLength] = useState<string>('');
  const [wallLengthUnit, setWallLengthUnit] = useState<LengthUnit>(DEFAULT_WALL_DIMENSION_UNIT);

  const [wallHeight, setWallHeight] = useState<string>('');
  const [wallHeightUnit, setWallHeightUnit] = useState<LengthUnit>(DEFAULT_WALL_DIMENSION_UNIT);

  const [wastagePercent, setWastagePercent] = useState<string>('');

  // Vendor pricing states
  const [vendorPrice, setVendorPrice] = useState<string>('');
  const [priceUnit, setPriceUnit] = useState<string>('per-linear-yard');

  // Result state
  const [result, setResult] = useState<{
    quantityWithWastage: number;
    totalQuantity: number;
    numberOfRolls: number;
    rollSize: number;
    unit: string;
    pricePerLinearYard?: number;
    totalCost?: number;
  } | null>(null);

  // Convert price to per linear yard based on price unit
  const convertPriceToPerLinearYard = 
const convertPriceToPerLinearYard = (
  price: number,
  unit: string,
  rollWidthInYards: number,
  rollSizeInYards: number
): number => {
  switch (unit) {
    case 'per-linear-yard':
      return price;

    case 'per-linear-foot':
      return price * 3;

    case 'per-square-meter':
      return price * (1 / 1.19599) * rollWidthInYards;

    case 'per-square-foot':
      return price * 9 * rollWidthInYards;

    case 'per-roll':
      return price / rollSizeInYards;

    default:
      throw new Error(`Unknown pricing unit: ${unit}`);
  }
};
  const handleCalculate = () => {
    // Validate inputs
    const rollWidthNum = parseFloat(rollWidth);
    const rollSizeNum = parseFloat(rollSize);
    const wallLengthNum = parseFloat(wallLength);
    const wallHeightNum = parseFloat(wallHeight);
    const wastageNum = wastagePercent ? parseFloat(wastagePercent) : 0;

    if (isNaN(rollWidthNum) || rollWidthNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid roll width');
      return;
    }

    if (isNaN(rollSizeNum) || rollSizeNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid roll/bolt size');
      return;
    }

    if (isNaN(wallLengthNum) || wallLengthNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid wall length');
      return;
    }

    if (isNaN(wallHeightNum) || wallHeightNum <= 0) {
      Alert.alert('Invalid Input', 'Please enter a valid wall height');
      return;
    }

    if (isNaN(wastageNum) || wastageNum < 0) {
      Alert.alert('Invalid Input', 'Please enter a valid wastage percentage (0 or greater)');
      return;
    }

    try {
      const inputs: WallCoveringInputs = {
        rollWidth: rollWidthNum,
        rollWidthUnit,
        wallLength: wallLengthNum,
        wallLengthUnit,
        wallHeight: wallHeightNum,
        wallHeightUnit,
        wastagePercent: wastageNum,
      };

      // Calculate linear length with wastage in yards
      const calculationResult = calculateWallCovering(inputs, 'yards');
      const quantityWithWastage = calculationResult.linearLength;

      // Convert roll size to yards for calculation
      const rollSizeInFeet = convertToFeet(rollSizeNum, rollSizeUnit);
      const rollSizeInYards = convertFromFeet(rollSizeInFeet, 'yards');

      // Calculate number of rolls (round up)
      const numberOfRolls = Math.ceil(quantityWithWastage / rollSizeInYards);

      // Calculate total quantity (rolls × roll size)
      const totalQuantity = numberOfRolls * rollSizeInYards;

      // Calculate pricing if vendor price is provided
      let pricePerLinearYard: number | undefined;
      let totalCost: number | undefined;

      if (vendorPrice) {
        const vendorPriceNum = parseFloat(vendorPrice);
        if (!isNaN(vendorPriceNum) && vendorPriceNum > 0) {
          // Convert roll width to yards for area calculations
          const rollWidthInFeet = convertToFeet(rollWidthNum, rollWidthUnit);
          const rollWidthInYards = convertFromFeet(rollWidthInFeet, 'yards');

          // Convert price to per linear yard based on price unit
          pricePerLinearYard = convertPriceToPerLinearYard(
            vendorPriceNum,
            priceUnit,
            rollWidthInYards,
            rollSizeInYards
          );

          // Calculate total cost = total quantity × price per linear yard
          totalCost = totalQuantity * pricePerLinearYard;
        }
      }

      setResult({
        quantityWithWastage,
        totalQuantity,
        numberOfRolls,
        rollSize: rollSizeInYards,
        unit: 'yards',
        pricePerLinearYard,
        totalCost,
      });
    } catch (error) {
      Alert.alert('Calculation Error', error instanceof Error ? error.message : 'An error occurred');
    }
  };

  const handleClear = () => {
    setRollWidth('');
    setRollWidthUnit(DEFAULT_ROLL_WIDTH_UNIT);
    setRollSize('');
    setRollSizeUnit('yards');
    setWallLength('');
    setWallLengthUnit(DEFAULT_WALL_DIMENSION_UNIT);
    setWallHeight('');
    setWallHeightUnit(DEFAULT_WALL_DIMENSION_UNIT);
    setWastagePercent('');
    setVendorPrice('');
    setPriceUnit('per-linear-yard');
    setResult(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Wall Covering Calculator</Text>
          <Text style={styles.subtitle}>Calculate material and roll quantities</Text>
        </View>

        <View style={styles.formContainer}>
          <InputField
            label="Roll Width"
            value={rollWidth}
            onChangeValue={setRollWidth}
            unit={rollWidthUnit}
            onChangeUnit={setRollWidthUnit}
            availableUnits={ROLL_WIDTH_UNITS}
            placeholder="Enter roll width"
          />

          <InputField
            label="Roll/Bolt Size"
            value={rollSize}
            onChangeValue={setRollSize}
            unit={rollSizeUnit}
            onChangeUnit={setRollSizeUnit}
            availableUnits={ROLL_WIDTH_UNITS}
            placeholder="Enter roll size"
          />

          <InputField
            label="Wall Length"
            value={wallLength}
            onChangeValue={setWallLength}
            unit={wallLengthUnit}
            onChangeUnit={setWallLengthUnit}
            availableUnits={WALL_DIMENSION_UNITS}
            placeholder="Enter wall length"
          />

          <InputField
            label="Wall Height"
            value={wallHeight}
            onChangeValue={setWallHeight}
            unit={wallHeightUnit}
            onChangeUnit={setWallHeightUnit}
            availableUnits={WALL_DIMENSION_UNITS}
            placeholder="Enter wall height"
          />

          <InputField
            label="Wastage Percentage"
            value={wastagePercent}
            onChangeValue={setWastagePercent}
            unit="feet" // Not used for percentage
            onChangeUnit={() => {}}
            availableUnits={[]}
            placeholder="0"
            isPercentage
          />

          {result && (
            <View style={styles.pricingInputContainer}>
              <Text style={styles.pricingInputTitle}>Pricing</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Vendor Price</Text>
                <View style={styles.inputRow}>
                  <TextInput
                    style={[styles.textInput, styles.flexInput]}
                    value={vendorPrice}
                    onChangeText={setVendorPrice}
                    placeholder="Enter price"
                    keyboardType="decimal-pad"
                    placeholderTextColor="#999"
                  />
                  <View style={styles.pickerContainer}>
                    <Picker
                      selectedValue={priceUnit}
                      onValueChange={(value) => setPriceUnit(value)}
                      style={styles.picker}
                    >
                      <Picker.Item label="Per Linear Yard" value="per-linear-yard" />
                      <Picker.Item label="Per Linear Foot" value="per-linear-foot" />
                      <Picker.Item label="Per Square Meter" value="per-square-meter" />
                      <Picker.Item label="Per Square Foot" value="per-square-foot" />
                      <Picker.Item label="Per Roll" value="per-roll" />
                    </Picker>
                  </View>
                </View>
              </View>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.calculateButton} onPress={handleCalculate}>
              <Text style={styles.calculateButtonText}>Calculate</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
              <Text style={styles.clearButtonText}>Clear</Text>
            </TouchableOpacity>
          </View>

          {result && (
            <>
              <View style={styles.resultsContainer}>
                <Text style={styles.resultsTitle}>Results</Text>

                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Quantity with Wastage</Text>
                  <Text style={styles.resultValue}>{formatNumber(result.quantityWithWastage, 2)} yards</Text>
                </View>

                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Total Quantity</Text>
                  <Text style={styles.resultValue}>{formatNumber(result.totalQuantity, 2)} yards</Text>
                </View>

                <View style={styles.resultCard}>
                  <Text style={styles.resultLabel}>Number of Rolls</Text>
                  <Text style={styles.resultValue}>{result.numberOfRolls} rolls</Text>
                </View>
              </View>

              {result.pricePerLinearYard !== undefined && result.totalCost !== undefined && (
                <View style={styles.pricingResultsContainer}>
                  <Text style={styles.pricingResultsTitle}>Pricing Results</Text>

                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Vendor Price per Linear Yard</Text>
                    <Text style={styles.resultValue}>${formatNumber(result.pricePerLinearYard, 2)} / yard</Text>
                  </View>

                  <View style={styles.resultCard}>
                    <Text style={styles.resultLabel}>Total Cost</Text>
                    <Text style={styles.resultValue}>${formatNumber(result.totalCost, 2)}</Text>
                  </View>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    backgroundColor: '#4A90E2',
  },
  backButton: {
    marginBottom: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  formContainer: {
    padding: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  calculateButton: {
    flex: 1,
    backgroundColor: '#4A90E2',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginRight: 12,
  },
  calculateButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  clearButton: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#4A90E2',
  },
  clearButtonText: {
    color: '#4A90E2',
    fontSize: 18,
    fontWeight: '600',
  },
  resultsContainer: {
    marginTop: 24,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  resultCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  resultLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
    fontWeight: '600',
  },
  resultValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#4A90E2',
  },
  pricingInputContainer: {
    marginTop: 24,
    paddingTop: 24,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
  },
  pricingInputTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  pricingResultsContainer: {
    marginTop: 24,
  },
  pricingResultsTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputRow: {
    flexDirection: 'row',
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
  },
  flexInput: {
    flex: 1,
    marginRight: 8,
  },
  pickerContainer: {
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    width: 160,
    justifyContent: 'center',
  },
  picker: {
    height: 48,
  },
});
