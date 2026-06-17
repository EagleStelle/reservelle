package org.lpu.dev.codes.services;

import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.lpu.dev.codes.model.apiresponse.AccountStatementResponse;
import org.lpu.dev.codes.model.apiresponse.PopulateUsersResponse;
import org.lpu.dev.codes.model.data.Users;
import org.lpu.dev.codes.model.dto.DeleteUserRequest;
import org.lpu.dev.codes.model.dto.PopulateUserList;
import org.lpu.dev.codes.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service

public class SuperAdminUserService {

	private static final Logger logger =
            LogManager.getLogger(SuperAdminUserService.class);
	
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private JWTService jwtservice;

	@Autowired
	private PasswordEncoder passwordEncoder;

	

	

	@Transactional
	public Users findByUserName(String username) {
		Users result = userRepository.findByUsername(username.toLowerCase());
		logger.info(String.format("Fetching username %s info", username));
		if (result == null) {
			logger.warn(String.format("Username %s not found", username));
			return null;
		} else {
			logger.info(String.format("Fetch Username %s Success!",username));
			return result;
		}

	}

	@Transactional
	public String findRolebyUsername(String username) {
		Users result = userRepository.findByUsername(username.toLowerCase());
		if (result == null) {
			return null;
		} else {
			return result.getRole();
		}
	}

	public List<PopulateUserList> mappedUserList(List<Users> users) {

		List<PopulateUserList> userList = users.stream().map(user -> {
			PopulateUserList dto = new PopulateUserList();

			dto.setId(user.getId());
			dto.setUsername(user.getUsername());
			dto.setFullname(user.getFullname());
			dto.setRole(user.getRole());
			dto.setEmail(user.getEmail());
			dto.setEmployeeId(user.getEmployeeId());
			dto.setStatus(user.getStatus());

			return dto;
		}).toList();

		return userList;

	}

	@Transactional
	public PopulateUsersResponse getAllUsers(String token) {
		logger.info("Getting User... Validating...");
		PopulateUsersResponse response = new PopulateUsersResponse();
		boolean validated = jwtservice.validateToken(token.replace("LpuL ", ""));
		
		try {
			List<Users> users = userRepository.getAllUsers();
			
			if (validated) {
				logger.info("Get User Success");
				response.setMessage("Get User Success");
				response.setSuccess(true);
				response.setUsers(mappedUserList(users));
				return response;

			} else {
				logger.info("Get User Fail: Unvalidated Session");
				response.setSuccess(false);
				response.setMessage("Unvalidated Session");
				response.setUsers(null);
				return response;
			}
		} catch (Exception e) {
			response.setSuccess(false);
			response.setMessage("Database Failure");
			return response;
		}

	}



	@Transactional
	public AccountStatementResponse createAccount(String token, Users user) {

		AccountStatementResponse response = new AccountStatementResponse();
		logger.info("Started Account Creation Sevice");
		try {
			
			// Validate token first
			boolean validated = jwtservice.validateToken(token.replace("LpuL ", ""));
			

			if (!validated) {
				logger.warn("Account Creation Service Closing: Not Valid Token");
				response.setSuccess(false);
				response.setMessage("Unvalidated Session");
				return response;
			}
			// Check duplicate username
			Users existingUser = userRepository.findByUsername(user.getUsername());

			if (existingUser != null) {
				logger.info(String.format("Username: %s Already Exist",user.getUsername()));
				response.setSuccess(false);
				response.setMessage("Username already exists");
				return response;
			}

			// Hash password
			user.setPasswordHash(passwordEncoder.encode(user.getPasswordHash()));

			// Optional default status
			if (user.getStatus() == null || user.getStatus().isBlank()) {
				user.setStatus("ACTIVE");
			}

			userRepository.save(user);

			response.setSuccess(true);
			response.setMessage("Create Account Success");
			
			logger.info(String.format("Account Creation Success %s %s %s %s", user.getEmployeeId(),user.getEmail(), user.getFullname(), user.getRole()));

			return response;

		} catch (Exception e) {

			response.setSuccess(false);
			logger.error(String.format("Failed to create account %s", e.getMessage()));
			response.setMessage("Failed to create account: " + e.getMessage());

			return response;
		}

	}

	@Transactional
	public AccountStatementResponse deleteAccountbyEmpId(String token, DeleteUserRequest user) {

	    AccountStatementResponse response = new AccountStatementResponse();

	    try {

	        logger.info("Delete account request received for Employee ID: {}", user.getEmpId());

	        if (!jwtservice.validateToken(token.replace("LpuL ", ""))) {
	            logger.warn("Delete account failed. Invalid session. Employee ID: {}", user.getEmpId());

	            response.setSuccess(false);
	            response.setMessage("Unvalidated Session");
	            return response;
	        }

	        boolean deleted = userRepository.deleteUserByEmpId(user.getEmpId());

	        if (deleted) {
	            logger.info("User deleted successfully. Employee ID: {}", user.getEmpId());

	            response.setSuccess(true);
	            response.setMessage("Delete User Success");
	        } else {
	            logger.warn("Delete account failed. User not found. Employee ID: {}", user.getEmpId());

	            response.setSuccess(false);
	            response.setMessage("User not found");
	        }

	        return response;

	    } catch (Exception e) {
	        logger.error("Error deleting user. Employee ID: {}", user.getEmpId(), e);
	        throw new RuntimeException("Failed to delete user", e);
	    }
	}

	@Transactional
	public AccountStatementResponse toggleAccountStatus(String empId) {

	    AccountStatementResponse response = new AccountStatementResponse();

	    try {

	        logger.info("Toggle account status request received. Employee ID: {}", empId);

	        Users user = userRepository.findByEmployeeId(empId);

	        if (user == null) {

	            logger.warn("Toggle account status failed. User not found. Employee ID: {}", empId);

	            response.setSuccess(false);
	            response.setMessage("User not found");
	            return response;
	        }

	        String oldStatus = user.getStatus();
	        String newStatus = "ACTIVE";

	        if ("ACTIVE".equalsIgnoreCase(oldStatus)) {
	            newStatus = "INACTIVE";
	        }

	        boolean updated = userRepository.updateStatus(empId, newStatus);

	        if (updated) {
	            logger.info(
	                "User status updated successfully. Employee ID: {}, Old Status: {}, New Status: {}",
	                empId,
	                oldStatus,
	                newStatus
	            );
	        } else {
	            logger.warn(
	                "Failed to update status. Employee ID: {}, Requested Status: {}",
	                empId,
	                newStatus
	            );
	        }

	        response.setSuccess(updated);
	        response.setMessage(updated
	                ? "Account status changed to " + newStatus
	                : "Failed to update account status");

	        return response;

	    } catch (Exception e) {

	        logger.error("Error toggling account status. Employee ID: {}", empId, e);

	        response.setSuccess(false);
	        response.setMessage("Failed to update account status");

	        return response;
	    }
	}
}
