# Full Persona Tool Catalog

Generated from `persona_manifest.json` on 2026-05-13.

Total personas: **20**
Total tool grants (sum across personas): **519**

## Admin_Assistant

- Description: Chief of Staff. Logistics, scheduling, reminders, backlog flow, and operational coordination.
- Core skill: Scheduling & Operations
- Delegations: Goals, Routines, Medical, Business_Ops, Vault_Brain
- Tool count: 103

### Tools

- `api_generate_schedule`
- `api_process_end_of_day`
- `api_schedule_task`
- `api_get_rolling_week`
- `api_get_weekly_planner`
- `api_tidy_weekly_planner`
- `api_run_backlog_audit`
- `api_add_reminder`
- `api_get_due_reminders`
- `api_dismiss_reminder`
- `api_save_reference_list`
- `api_get_reference_list`
- `api_find_related_list`
- `api_get_shopping_reminder`
- `api_get_view`
- `api_list_horizons`
- `api_get_planning_summary`
- `api_add_birthday`
- `api_list_birthdays`
- `api_add_special_event`
- `api_list_special_events`
- `api_add_public_holiday`
- `api_list_public_holidays`
- `api_get_upcoming_events`
- `api_sync_events_to_reminders`
- `api_remove_event`
- `api_export_to_ical`
- `api_schedule_monthly_persona_audit`
- `api_get_persona_audit_schedule`
- `api_refresh_persona_audit_schedule`
- `api_run_backlog_pass`
- `api_archive_completed_tasks`
- `api_analyze_template_health`
- `api_detect_orphan_workflows`
- `api_start_backlog_scheduler`
- `api_stop_backlog_scheduler`
- `api_backlog_scheduler_status`
- `api_detect_intra_active_duplicates`
- `api_audit_backlog_integrity`
- `api_fix_backlog_integrity`
- `api_queue_background_task`
- `api_get_queue_status`
- `api_cancel_queued_task`
- `api_stop_queue_worker`
- `api_start_project`
- `api_get_project_status`
- `api_pause_project`
- `api_resume_project`
- `api_stop_project`
- `api_advance_project`
- `api_stop_project_runner`
- `api_suggest_happiness_tour_block`
- `api_schedule_happiness_tour_block`
- `api_get_happiness_tour_status`
- `api_generate_morning_affirmations`
- `api_read_morning_affirmations`
- `api_get_current_weather`
- `api_add_garment`
- `api_list_wardrobe`
- `api_get_garment`
- `api_tag_garment`
- `api_remove_garment`
- `api_log_last_worn`
- `api_build_outfit`
- `api_list_outfits`
- `api_get_outfit`
- `api_get_wardrobe_capability_map`
- `api_generate_morning_briefing`
- `api_get_latest_briefing`
- `api_send_morning_briefing_to_discord`
- `api_load_food_plan`
- `api_save_food_plan`
- `api_create_food_plan_shopping_list`
- `api_record_price`
- `api_get_best_price`
- `api_get_store_specials_info`
- `api_set_household_regulars`
- `api_list_shopping_lists`
- `api_list_scrapeable_sources`
- `api_record_special`
- `api_get_active_specials`
- `api_match_specials_to_food_plan`
- `api_set_food_budget`
- `api_get_food_budget`
- `api_get_food_budget_summary`
- `api_fetch_aldi_specials`
- `api_fetch_iga_specials`
- `api_seed_local_supplier_catalog`
- `api_record_local_supplier`
- `api_query_local_suppliers`
- `api_fetch_bcfm_producers`
- `api_import_bcfm_producers`
- `api_maton_gcal_list_events`
- `api_maton_outlook_list_calendar_events`
- `api_calendar_validate_event_safety`
- `api_calendar_list_events`
- `api_calendar_get_today_events`
- `api_calendar_get_day_plan`
- `api_calendar_get_week_plan`
- `api_calendar_summarise_upcoming`
- `api_calendar_get_briefing_block`
- `api_maton_gcal_create_event`
- `api_maton_outlook_create_event`

## Business_Ops

- Description: Business Operations Coordinator. Tracks milestones, sourcing leads, grant opportunities, and business admin across domains.
- Core skill: Business Operations
- Delegations: CFO, Goals, Admin_Assistant, Inspiration, Internal_Memory_Retrieval, Websearch, External_Memory_Retrieval, Security
- Tool count: 39

### Tools

- `api_track_business_milestone`
- `api_list_business_milestones`
- `api_create_business_goal`
- `api_log_milestone`
- `api_get_milestone_status`
- `api_review_milestone_progress`
- `api_add_sourcing_lead`
- `api_list_sourcing_leads`
- `api_estimate_sourcing_margin`
- `api_log_grant_opportunity`
- `api_list_grant_opportunities`
- `api_score_grant_relevance`
- `api_draft_and_redteam_business_plan`
- `api_get_redteam_workflow_insights`
- `api_record_workflow`
- `api_create_plan`
- `api_get_plan`
- `api_get_plan_summary`
- `api_update_section`
- `api_update_compliance`
- `api_add_research_anchor`
- `api_flag_stale_research`
- `api_log_plan_update`
- `api_get_capability_map`
- `api_set_revenue_target`
- `api_evaluate_revenue_pathways`
- `api_generate_revenue_plan`
- `api_iterate_revenue_strategy`
- `api_log_revenue_cost`
- `api_get_revenue_progress`
- `api_check_deployment_target_safety`
- `api_intake_website_request`
- `api_evaluate_website_strategy`
- `api_generate_website_build_plan`
- `api_generate_github_pages_scaffold`
- `api_read_any_file`
- `api_write_any_file`
- `api_get_brand_context`
- `api_plan_branded_task`

## CFO

- Description: Chief Financial Officer. Tracks budgets, tradeoffs, and financial planning with mathematical discipline.
- Core skill: Financial Analysis
- Delegations: Medical, Business_Ops, Websearch, Internal_Memory_Retrieval, Goals, Routines, External_Memory_Retrieval
- Tool count: 16

### Tools

- `api_run_ai_allocator`
- `api_apply_allocator_triage`
- `api_get_bitcoin_price`
- `api_deep_cleanup_scan`
- `api_deep_cleanup_apply`
- `api_set_food_budget`
- `api_get_food_budget`
- `api_get_food_budget_summary`
- `api_log_expense`
- `api_log_income`
- `api_get_budget_summary`
- `api_log_meal_cost`
- `api_get_spending_trends`
- `api_generate_tax_summary`
- `api_research_investment`
- `api_log_investment_note`

## Consensus_Engine

- Description: Consensus and governance engine. Reviews decisions, audits voting history, scores consensus, manages governance logging, and validates phase transitions and proposal schemas. System-level persona â€” not user-facing.
- Core skill: Consensus & Governance
- Delegations: Vault_Brain, Security, Internal_Memory_Retrieval, Contextual_Thinking
- Tool count: 34

### Tools

- `api_calculate_subbot_metrics`
- `api_trend_analysis`
- `api_consensus_health_score`
- `api_failure_rate_by_reason`
- `api_export_metrics_csv`
- `api_filter_voting_history`
- `api_replay_consensus_scenario`
- `api_search_decisions`
- `api_export_audit_report`
- `api_get_decision_rationale`
- `api_log_kaos_decision`
- `api_get_decision_history`
- `api_get_decision_statistics`
- `api_check_safety_requirements`
- `api_get_legal_transitions`
- `api_validate_phase_transition`
- `api_get_phase_info`
- `api_is_phase_terminal`
- `api_read_mission_state`
- `api_list_checkpoints`
- `api_acquire_lock`
- `api_release_lock`
- `api_get_step_details`
- `api_get_available_steps`
- `api_get_subbot_consensus_score`
- `api_track_subbot_performance`
- `api_get_proposal_status`
- `api_validate_proposal_schema`
- `api_get_step_by_id`
- `api_submit_vote`
- `api_aggregate_votes`
- `api_calculate_consensus`
- `api_get_vote_history`
- `api_validate_consensus_state`

## Contextual_Thinking

- Description: Contextual intelligence layer. Tracks sentiment, joy patterns, persona usage, and skill indices to help vault_brain and other personas adapt to context, scheduling, and tone.
- Core skill: Contextual Analysis & Adaptation
- Delegations: Internal_Memory_Retrieval, Admin_Assistant, Medical, Routines
- Tool count: 12

### Tools

- `api_analyze_sentiment`
- `api_log_joy_activity`
- `api_add_known_joy_activity`
- `api_get_joy_activities`
- `api_get_high_joy_activities`
- `api_get_joy_summary`
- `api_log_persona_usage`
- `api_get_persona_profile`
- `api_index_folder_skills`
- `api_update_taste_profile`
- `api_get_taste_profile`
- `api_get_current_weather`

## Conversationalist

- Description: Social intelligence persona. Manages relationships, drafts audience-aware communication, and runs the social module.
- Core skill: Social Communication
- Delegations: Websearch, Internal_Memory_Retrieval, Business_Ops, Contextual_Thinking, Security
- Tool count: 53

### Tools

- `api_add_contact_to_allowlist`
- `api_add_network_edge`
- `api_archive_ocr_session`
- `api_assess_screenshot`
- `api_build_dark_triad_score`
- `api_capture_chat_via_ocr`
- `api_check_clocks`
- `api_create_club_profile`
- `api_create_profile`
- `api_create_relationship`
- `api_dismiss_response_draft`
- `api_evaluate_and_select`
- `api_generate_response_options`
- `api_get_chat_history`
- `api_get_due_commitments`
- `api_get_influence_summary`
- `api_get_network_edges`
- `api_get_network_summary`
- `api_get_next_response`
- `api_get_queue_summary`
- `api_get_relationship_log`
- `api_get_social_goals`
- `api_ingest_platform_export`
- `api_list_allowlist`
- `api_list_assessed_screenshots`
- `api_list_commitments`
- `api_list_expectations`
- `api_list_influence_attempts`
- `api_list_profiles`
- `api_list_relationships`
- `api_list_response_drafts`
- `api_load_club_profile`
- `api_load_past_comms_pack`
- `api_load_profile`
- `api_load_relationship_profile`
- `api_log_commitment`
- `api_log_dark_triad_signal`
- `api_log_influence_attempt`
- `api_log_message`
- `api_mark_commitment_complete`
- `api_mark_response_sent`
- `api_maton_gmail_send_email`
- `api_poll_instagram_webhook_queue`
- `api_process_ocr_session`
- `api_queue_response_draft`
- `api_run_network_analysis`
- `api_run_strategist_analysis`
- `api_save_relationship_profile`
- `api_scaffold_past_comms_pack`
- `api_set_expectation`
- `api_set_social_goal`
- `api_update_last_contact`
- `api_update_profile`

## External_Memory_Retrieval

- Description: Acquires and scouts material outside the Vault for later intake.
- Core skill: External Acquisition
- Delegations: Living_Memory, Internal_Memory_Retrieval, Websearch, Security
- Tool count: 16

### Tools

- `api_scan_external_with_memory`
- `api_scan_for_reserves`
- `api_scout_directory`
- `api_get_dir_size`
- `api_list_python_scripts`
- `api_start_phone_cleanoff_session`
- `api_intake_text_block`
- `api_complete_phone_cleanoff_session`
- `api_get_phone_cleanoff_status`
- `api_start_phone_dump`
- `api_end_phone_dump`
- `api_list_phone_dump_sessions`
- `api_test_maton_config`
- `api_list_connections`
- `api_get_connections_by_app`
- `api_set_preferred_connection`

## Goals

- Description: Strategic planner. Breaks clarified ambitions into projects, milestones, and success criteria.
- Core skill: Project Management
- Delegations: Inspiration, CFO, Medical, Routines, Admin_Assistant, Business_Ops, Internal_Memory_Retrieval, Consensus_Engine
- Tool count: 12

### Tools

- `api_add_new_goal`
- `api_run_assessment`
- `api_define_project_roadmap`
- `api_notify_health_of_goal`
- `api_sync_managed_goal`
- `api_generate_ambition_plan`
- `api_review_ambition_plan`
- `api_respond_to_ambition_plan`
- `api_insert_ambition_plan`
- `api_create_research_project`
- `api_add_research_note`
- `api_generate_knowledge_map`

## Image_Processor

- Description: Visual creator and image-workflow specialist for art generation, analysis, and image task pipelines.
- Core skill: Visual Creation
- Delegations: Websearch, Videographer, Business_Ops
- Tool count: 48

### Tools

- `api_process_todo_images`
- `api_query_huggingface`
- `api_generate_image_workflow`
- `api_generate_image_direct`
- `api_check_hf_authentication`
- `api_list_active_hf_models`
- `api_download_hf_file`
- `api_ab_test_hf_models`
- `api_judge_hf_outputs`
- `api_load_memory`
- `api_save_memory`
- `api_log_model_performance`
- `api_get_best_hf_model`
- `api_refine_hf_output`
- `api_extract_structured_planners`
- `api_sort_models_by_cost`
- `api_estimate_task_cost`
- `api_check_local_server`
- `api_query_local_model`
- `api_process_image_inbox`
- `api_queue_design_request`
- `api_list_design_queue`
- `api_generate_image_prompt`
- `api_get_design_capability_map`
- `api_queue_media_request`
- `api_get_media_queue`
- `api_file_media_output`
- `api_generate_and_file_media`
- `api_get_hf_media_status`
- `api_log_model_outcome`
- `api_get_model_preferences`
- `api_get_preference_score`
- `api_reset_model_preferences`
- `api_get_ordered_cascade`
- `api_record_ab_test`
- `api_get_ab_log`
- `api_get_top_preferences`
- `api_get_hf_preference_status`
- `api_ab_image_judge`
- `api_compare_image_models`
- `api_rate_media_output`
- `api_get_eval_log`
- `api_get_eval_summary`
- `api_run_batch_evaluation`
- `api_get_multimodal_eval_status`
- `api_list_hf_trending_models`
- `api_get_hf_pipeline_tags`
- `api_select_pipeline_tag_for_task`

## Inspiration

- Description: Ambition interpreter. Turns raw sparks, wishes, and obsessions into clear directions for the Vault.
- Core skill: Ambition Discovery & Framing
- Delegations: Goals, Routines, Admin_Assistant, CFO, Medical, Business_Ops, Image_Processor, Websearch, Internal_Memory_Retrieval, Contextual_Thinking
- Tool count: 4

### Tools

- `api_intake_ambition`
- `api_list_ambitions`
- `api_read_any_file`
- `api_write_any_file`

## Internal_Memory_Retrieval

- Description: Vault librarian. Retrieves and synthesizes what already exists inside the Vault.
- Core skill: Memory Retrieval
- Delegations: Contextual_Thinking
- Tool count: 7

### Tools

- `api_query_memory`
- `api_generate_readable_overview`
- `api_list_files`
- `api_generate_directory_tree`
- `api_deep_query_memory`
- `api_get_memory_status`
- `api_query_governance_docs`

## Living_Memory

- Description: Memory curator. Decides what should become structured memory and where it belongs.
- Core skill: Memory Curation
- Delegations: Internal_Memory_Retrieval, External_Memory_Retrieval, Security
- Tool count: 16

### Tools

- `api_process_inbox`
- `api_process_image_inbox`
- `api_auto_sort`
- `api_advanced_auto_sort`
- `api_format_notes_chunk`
- `api_ingest_documents`
- `api_process_subcat_notes`
- `api_process_todo_notes`
- `api_generate_organization_plan`
- `api_apply_organization_plan`
- `api_audit_inbox_routing`
- `api_rollback_inbox_routing`
- `api_append_folder_prefix`
- `api_build_semantic_memory`
- `api_apply_notes_audit`
- `api_extract_pdf_text`

## Master_Coder

- Description: Architects, writes, debugs, and refactors software.
- Core skill: Software Engineering
- Delegations: Security, Vault_Architect, Internal_Memory_Retrieval, Vault_Brain
- Tool count: 15

### Tools

- `api_read_source_code`
- `api_read_any_file`
- `api_write_any_file`
- `api_forge_new_tool`
- `api_delete_script`
- `api_scan_dependencies`
- `api_check_import_targets`
- `api_apply_standardized_code`
- `api_run_tests`
- `api_install_python_package`
- `api_get_repo_info`
- `api_list_repo_events`
- `api_list_issues`
- `api_list_pull_requests`
- `api_get_notifications`

## Medical

- Description: Health, nutrition, exercise, and wellbeing coordinator with strict non-diagnostic boundaries.
- Core skill: Health & Nutrition
- Delegations: Goals, Routines, Admin_Assistant, Websearch, Contextual_Thinking
- Tool count: 62

### Tools

- `api_log_health_metric`
- `api_read_health_data`
- `api_log_happiness_experiment`
- `api_read_happiness_experiments`
- `api_log_steps`
- `api_log_exercise`
- `api_log_mood_check`
- `api_log_cycle_day`
- `api_get_cycle_day`
- `api_get_cycle_summary`
- `api_get_reproductive_health_privacy_notice`
- `api_correlate_cycle_mood`
- `api_predict_next_period`
- `api_get_symptom_trends`
- `api_read_exercise_log`
- `api_record_food_preference`
- `api_get_food_preferences`
- `api_add_health_todo`
- `api_list_health_todos`
- `api_complete_health_todo`
- `api_setup_health_profile`
- `api_get_health_profile`
- `api_update_health_profile`
- `api_get_nutrition_targets`
- `api_update_nutrition_target`
- `api_generate_food_plan`
- `api_get_nutrition_summary`
- `api_get_health_insights`
- `api_research_nutrient`
- `api_load_food_plan`
- `api_save_food_plan`
- `api_create_food_plan_shopping_list`
- `api_get_kitchen_inventory`
- `api_add_kitchen_item`
- `api_update_kitchen_item`
- `api_remove_kitchen_item`
- `api_run_stocktake_check`
- `api_confirm_stocktake`
- `api_get_inventory_gaps`
- `api_get_expiring_items`
- `api_get_food_budget_summary`
- `api_read_mood_state`
- `api_add_journal_entry`
- `api_read_journal`
- `api_search_journal`
- `api_add_prescription`
- `api_list_prescriptions`
- `api_deactivate_prescription`
- `api_get_food_constraints`
- `api_add_coping_strategy`
- `api_get_panic_context`
- `api_log_panic_episode`
- `api_list_coping_strategies`
- `api_log_sleep`
- `api_read_sleep_log`
- `api_set_focus_intent`
- `api_read_wellbeing_state`
- `api_get_checkin_schedule`
- `api_reflect_on_journal`
- `api_generate_doctor_update`
- `api_generate_specialist_update`
- `api_generate_psych_update`

## Routines

- Description: Habit and cadence designer. Turns goals into sustainable repetition and daily/weekly systems.
- Core skill: Behavioral Science
- Delegations: Goals, Medical, Websearch, Internal_Memory_Retrieval, External_Memory_Retrieval, Admin_Assistant, Contextual_Thinking
- Tool count: 5

### Tools

- `api_draft_routine`
- `api_save_routine`
- `api_notify_health_of_routine`
- `api_get_current_routines`
- `api_list_saved_routines`

## Security

- Description: Chief Security Officer. Zero Trust auditor for code, secrets, and hallucination hygiene.
- Core skill: Security Auditing
- Delegations: Vault_Architect, Master_Coder, Vault_Brain
- Tool count: 15

### Tools

- `api_cleanup_hallucinations`
- `api_audit_script_standards`
- `api_audit_notes`
- `api_scan_is_clean`
- `api_scan_secrets`
- `api_validate_env`
- `api_get_canonical_env_reference`
- `api_check_key_is_canonical`
- `api_get_provider_rules`
- `api_check_is_exempt`
- `api_audit_provider_boundary`
- `api_preflight_public_exposure_check`
- `api_check_repo_visibility_safety`
- `api_generate_notes_audit`
- `api_generate_vault_audit`

## Vault_Architect

- Description: Structural engineer. Governs core script DNA, architecture boundaries, and expansion logic.
- Core skill: Architecture & Structure
- Delegations: Master_Coder, Security, Living_Memory, Vault_Brain, Consensus_Engine, Business_Ops
- Tool count: 21

### Tools

- `api_analyze_structure`
- `api_apply_structure_fixes`
- `api_vault_architect`
- `api_apply_expansions`
- `api_auto_expand`
- `api_reassess_vault`
- `api_write_env_variable`
- `api_get_policy_context`
- `api_check_contract`
- `api_get_path_authority`
- `api_generate_restructure_plan`
- `api_apply_restructure_plan`
- `api_generate_vault_audit`
- `api_apply_vault_audit`
- `api_create_directory`
- `api_scan_env_for_service_keys`
- `api_list_known_service_patterns`
- `api_audit_my_tool_grants`
- `api_run_persona_peer_audit`
- `api_get_exhaustive_python_lane_status`
- `api_run_exhaustive_python_lane`

## Vault_Brain

- Description: System runtime steward. Governs routing, proposal flow, human-action queues, backlog operations, mode and state control, and high-level runtime coordination across the Vault.
- Core skill: Runtime Governance
- Delegations: Consensus_Engine, Security, Vault_Architect, Master_Coder, Admin_Assistant, Internal_Memory_Retrieval, Contextual_Thinking
- Tool count: 21

### Tools

- `api_get_routing_rules`
- `api_route_new_item`
- `api_transition_item`
- `api_audit_filing`
- `api_log_human_action_required`
- `api_list_pending_human_actions`
- `api_resolve_human_action`
- `api_submit_proposal`
- `api_list_proposals`
- `api_promote_proposal`
- `api_append_tasks`
- `api_generate_vault_summary`
- `api_get_vault_summary`
- `api_log_recommended_action`
- `api_accept_recommended_action`
- `api_dismiss_recommended_action`
- `api_set_mode`
- `api_get_mode`
- `api_preflight_public_exposure_check`
- `api_deploy_to_vercel`
- `api_deploy_to_netlify`

## Videographer

- Description: Cinematic editor. Produces timestamped video plans and coordinates related visual assets.
- Core skill: Video Production
- Delegations: Image_Processor, Websearch, Business_Ops
- Tool count: 8

### Tools

- `api_read_any_file`
- `api_write_any_file`
- `api_video_ingest_check_dependencies`
- `api_ingest_video_link`
- `api_add_video_project`
- `api_list_video_projects`
- `api_get_video_project`
- `api_generate_tts`

## Websearch

- Description: OSINT and internet research specialist.
- Core skill: Web Research
- Delegations: Internal_Memory_Retrieval, Security
- Tool count: 12

### Tools

- `api_fetch_url_content`
- `api_read_any_file`
- `api_web_search`
- `api_extract_links`
- `api_delegate_web_research`
- `api_save_research_note`
- `api_get_research_notes`
- `api_delete_research_note`
- `api_extract_pdf_text`
- `api_scrape_site`
- `api_list_scrape_sessions`
- `api_get_scrape_session`
