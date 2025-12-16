import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Button, Card, Chip, Divider, IconButton } from 'react-native-paper';
import { TaskTemplate, DEFAULT_TEMPLATES } from '../types/template';
import { COLORS, SPACING, BORDER_RADIUS } from '../constants/theme';
import { CATEGORY_COLORS } from '../constants/categories';
import { URGENCY_COLORS } from '../constants/urgencyLevels';

interface TemplatePickerModalProps {
  visible: boolean;
  onDismiss: () => void;
  onSelectTemplate: (template: TaskTemplate) => void;
  customTemplates?: TaskTemplate[];
}

export const TemplatePickerModal: React.FC<TemplatePickerModalProps> = ({
  visible,
  onDismiss,
  onSelectTemplate,
  customTemplates = [],
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | null>(null);

  const handleSelectTemplate = (template: Omit<TaskTemplate, 'templateId' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    // Convert default template to TaskTemplate format
    const fullTemplate: TaskTemplate = {
      ...template,
      templateId: `default_${template.name.toLowerCase().replace(/\s+/g, '_')}`,
      userId: undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setSelectedTemplate(fullTemplate);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setSelectedTemplate(null);
      onDismiss();
    }
  };

  const handleCancel = () => {
    setSelectedTemplate(null);
    onDismiss();
  };

  const renderTemplateCard = (
    template: Omit<TaskTemplate, 'templateId' | 'userId' | 'createdAt' | 'updatedAt'> | TaskTemplate,
    isCustom: boolean = false
  ) => {
    const isSelected = selectedTemplate?.name === template.name;

    return (
      <TouchableOpacity
        key={template.name}
        onPress={() => handleSelectTemplate(template)}
        activeOpacity={0.7}
      >
        <Card
          style={[
            styles.templateCard,
            isSelected && styles.selectedCard,
          ]}
        >
          <Card.Content>
            <View style={styles.templateHeader}>
              <View style={styles.templateTitleRow}>
                {template.icon && <Text style={styles.templateIcon}>{template.icon}</Text>}
                <Text variant="titleMedium" style={styles.templateName}>
                  {template.name}
                </Text>
              </View>
              {isSelected && (
                <IconButton
                  icon="check-circle"
                  size={24}
                  iconColor={COLORS.success}
                  style={styles.checkIcon}
                />
              )}
            </View>

            {template.description && (
              <Text variant="bodySmall" style={styles.templateDescription}>
                {template.description}
              </Text>
            )}

            <View style={styles.templateMeta}>
              <Chip
                style={[styles.metaChip, { backgroundColor: CATEGORY_COLORS[template.category] }]}
                textStyle={styles.metaChipText}
                compact
              >
                {template.category}
              </Chip>
              <Chip
                style={[styles.metaChip, { backgroundColor: URGENCY_COLORS[template.urgency] }]}
                textStyle={styles.metaChipText}
                compact
              >
                {template.urgency}
              </Chip>
              {template.estimatedDuration && (
                <Chip
                  style={styles.durationChip}
                  textStyle={styles.durationChipText}
                  compact
                  mode="outlined"
                >
                  ~{template.estimatedDuration}m
                </Chip>
              )}
            </View>

            {template.subtasks && template.subtasks.length > 0 && (
              <View style={styles.subtasksPreview}>
                <Text variant="labelSmall" style={styles.subtasksLabel}>
                  {template.subtasks.length} subtasks:
                </Text>
                {template.subtasks.slice(0, 3).map((subtask, index) => (
                  <Text key={index} variant="bodySmall" style={styles.subtaskItem}>
                    • {subtask.title}
                  </Text>
                ))}
                {template.subtasks.length > 3 && (
                  <Text variant="bodySmall" style={styles.subtaskItem}>
                    ... and {template.subtasks.length - 3} more
                  </Text>
                )}
              </View>
            )}
          </Card.Content>
        </Card>
      </TouchableOpacity>
    );
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modalContainer}
      >
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text variant="headlineSmall" style={styles.modalTitle}>
              Choose a Template
            </Text>
            <IconButton
              icon="close"
              size={24}
              onPress={handleCancel}
            />
          </View>

          <Divider />

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Default Templates */}
            <Text variant="titleMedium" style={styles.sectionTitle}>
              Default Templates
            </Text>
            {DEFAULT_TEMPLATES.map((template) => renderTemplateCard(template, false))}

            {/* Custom Templates */}
            {customTemplates.length > 0 && (
              <>
                <Text variant="titleMedium" style={[styles.sectionTitle, styles.customSection]}>
                  My Templates
                </Text>
                {customTemplates.map((template) => renderTemplateCard(template, true))}
              </>
            )}
          </ScrollView>

          <Divider />

          <View style={styles.modalActions}>
            <Button
              mode="outlined"
              onPress={handleCancel}
              style={styles.actionButton}
            >
              Cancel
            </Button>
            <Button
              mode="contained"
              onPress={handleConfirm}
              disabled={!selectedTemplate}
              style={styles.actionButton}
            >
              Use Template
            </Button>
          </View>
        </View>
      </Modal>
    </Portal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    margin: SPACING.lg,
    maxHeight: '80%',
  },
  modalContent: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.lg,
    maxHeight: '100%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    paddingBottom: SPACING.md,
  },
  modalTitle: {
    fontWeight: '700',
  },
  scrollView: {
    maxHeight: 500,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  sectionTitle: {
    fontWeight: '600',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
    color: COLORS.text,
  },
  customSection: {
    marginTop: SPACING.lg,
  },
  templateCard: {
    marginBottom: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    elevation: 1,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedCard: {
    borderColor: COLORS.primary,
    backgroundColor: `${COLORS.primary}10`,
  },
  templateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  templateTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  templateIcon: {
    fontSize: 24,
    marginRight: SPACING.sm,
  },
  templateName: {
    fontWeight: '600',
    flex: 1,
  },
  checkIcon: {
    margin: 0,
  },
  templateDescription: {
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  templateMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.sm,
  },
  metaChip: {
    height: 24,
  },
  metaChipText: {
    color: '#fff',
    fontSize: 11,
    marginVertical: 0,
  },
  durationChip: {
    height: 24,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: COLORS.textSecondary,
  },
  durationChipText: {
    fontSize: 11,
    marginVertical: 0,
    color: COLORS.textSecondary,
  },
  subtasksPreview: {
    marginTop: SPACING.sm,
    padding: SPACING.sm,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.sm,
  },
  subtasksLabel: {
    fontWeight: '600',
    marginBottom: SPACING.xs,
    color: COLORS.textSecondary,
  },
  subtaskItem: {
    color: COLORS.textSecondary,
    marginLeft: SPACING.xs,
    marginVertical: 2,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: SPACING.sm,
    padding: SPACING.lg,
    paddingTop: SPACING.md,
  },
  actionButton: {
    minWidth: 100,
  },
});
