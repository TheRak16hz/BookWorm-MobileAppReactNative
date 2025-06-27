// assets/styles/etapasPosts.styles.js
import { StyleSheet } from "react-native";
import COLORS from "../../constants/colors";

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 16,
    backgroundColor: COLORS.background,
  },
  card: {
    backgroundColor: COLORS.cardBackground,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.textPrimary,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  picker: {
    backgroundColor: COLORS.inputBackground,
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    backgroundColor: COLORS.inputBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: COLORS.white,
    fontWeight: "600",
    fontSize: 14,
    marginLeft: 6,
  },
  label: {
    fontWeight: "600",
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  value: {
    marginBottom: 4,
    color: COLORS.textDark,
  },
  emptyText: {
    textAlign: "center",
    color: COLORS.textSecondary,
    marginTop: 12,
  },
  juradoItem: {
  padding: 10,
  borderWidth: 1,
  borderColor: COLORS.border,
  borderRadius: 8,
  marginBottom: 8
},
juradoItemSelected: {
  backgroundColor: COLORS.primary,
  borderColor: COLORS.primary
}


});

export default styles;
