from flask import Flask, request, jsonify
import requests
import json
import base64
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad
import re

app = Flask(__name__)

class UtkarshAPI:
    def __init__(self):
        self.session = requests.Session()
        self.csrf_token = None
        self.headers = {
            "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            "X-Requested-With": "XMLHttpRequest",
            "Origin": "https://online.utkarsh.com",
        }
        self.master_cat_id = "11"
        self.cat_val_text = "Rajasthan Govt Exams"
        self.cached_data = None
        self.base_url = "https://online.utkarsh.com"

        # Video meta API configuration
        self.meta_api_base = "https://application.utkarshapp.com/index.php/data_model"
        self.meta_path = "/meta_distributer/on_request_meta_source"
        self.auth_header = "Bearer 152#svf346t45ybrer34yredk76t"

        # Key/IV generation characters
        self.key_chars = "%!F*&^$)_*%3f&B+"
        self.iv_chars = "#*$DJvyw2w%!_-$@"

        # Default JWT token (can be updated if needed)
        self.default_jwt = "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjEzNzQ0NTQiLCJkZXZpY2VfdHlwZSI6IjQiLCJ2ZXJzaW9uX2NvZGUiOiIxIiwiaWNyIjoiMyIsImlhdCI6MTc2ODg0MTU3NiwiZXhwIjoxNzcxMDAxNTc2fQ.HBT381L3uVKqOYjYc2ZtSyDaAkfHSuchkHm8926z8TA"

    def generate_key_iv(self, user_id: str):
        """Generate key and IV from user_id (like tl.py)"""
        seed = (user_id + "1524567456436545")[:16]
        key = "".join(self.key_chars[int(i)] for i in seed).encode()
        iv = "".join(self.iv_chars[int(i)] for i in seed).encode()
        return key, iv

    def encrypt_payload(self, data, key, iv):
        """Encrypt payload for meta API"""
        cipher = AES.new(key, AES.MODE_CBC, iv)
        raw = json.dumps(data, separators=(",", ":")).encode()
        enc = cipher.encrypt(pad(raw, AES.block_size))
        return base64.b64encode(enc).decode() + ":"

    def decrypt_payload(self, enc, key, iv):
        """Decrypt payload from meta API"""
        enc = base64.b64decode(enc.split(":")[0])
        cipher = AES.new(key, AES.MODE_CBC, iv)
        dec = cipher.decrypt(enc)
        dec = unpad(dec, AES.block_size).decode()
        return json.loads(dec)

    def decrypt_stream(self, enc):
        """Alternative decryption function similar to tl.py"""
        try:
            enc = base64.b64decode(enc)
            key = b'%!$!%_$&!%F)&^!^'
            iv = b'#*y*#2yJ*#$wJv*v'

            cipher = AES.new(key, AES.MODE_CBC, iv)
            data = cipher.decrypt(enc)

            try:
                data = unpad(data, AES.block_size).decode()
            except:
                data = data.decode(errors="ignore")

            # Try to parse JSON from end of string
            for i in range(len(data), 0, -1):
                try:
                    return json.loads(data[:i])
                except:
                    pass

            return None
        except Exception as e:
            print(f"❌ Stream decryption error: {e}")
            return None

    def decrypt_stream_optimized(self, encrypted_data):
        """Decrypt encrypted data from API"""
        try:
            enc = base64.b64decode(encrypted_data)

            key = b'%!$!%_$&!%F)&^!^'
            iv = b'#*y*#2yJ*#$wJv*v'

            cipher = AES.new(key, AES.MODE_CBC, iv)
            decrypted_bytes = cipher.decrypt(enc)

            last_byte = decrypted_bytes[-1]
            if last_byte <= 16:
                decrypted_bytes = decrypted_bytes[:-last_byte]

            plaintext = decrypted_bytes.decode('utf-8', errors='ignore')

            # Find JSON boundaries
            start = plaintext.find('{')
            if start == -1:
                start = plaintext.find('[')
                if start == -1:
                    return None

            if plaintext[start] == '{':
                stack = []
                for i in range(start, len(plaintext)):
                    if plaintext[i] == '{':
                        stack.append('{')
                    elif plaintext[i] == '}':
                        if stack:
                            stack.pop()
                            if not stack:
                                json_str = plaintext[start:i+1]
                                try:
                                    return json.loads(json_str)
                                except json.JSONDecodeError:
                                    json_str = re.sub(r',(\s*[}\]])', r'\1', json_str)
                                    return json.loads(json_str)
            return None

        except Exception as e:
            print(f"❌ Decryption error: {e}")
            return None

    def encrypt_data(self, data):
        """Encrypt data with same key and IV as decryption"""
        try:
            key = b'%!$!%_$&!%F)&^!^'
            iv = b'#*y*#2yJ*#$wJv*v'

            cipher = AES.new(key, AES.MODE_CBC, iv)
            padded_data = pad(data.encode('utf-8'), AES.block_size)
            encrypted_bytes = cipher.encrypt(padded_data)
            encrypted_b64 = base64.b64encode(encrypted_bytes).decode('utf-8')
            return encrypted_b64
        except Exception as e:
            print(f"❌ Encryption error: {e}")
            return None

    def get_csrf_token(self):
        """Get CSRF token"""
        try:
            response = self.session.get(self.base_url, headers=self.headers)
            self.csrf_token = response.cookies.get('csrf_name')

            if not self.csrf_token:
                csrf_match = re.search(r'name="csrf_name" value="([^"]+)"', response.text)
                if csrf_match:
                    self.csrf_token = csrf_match.group(1)

            if self.csrf_token:
                return True
            return False
        except Exception as e:
            print(f"❌ Error: {e}")
            return False

    def fetch_data(self):
        """Fetch and decrypt data from API"""
        if not self.csrf_token and not self.get_csrf_token():
            return None

        url = f"{self.base_url}/web/Home/getMasterCat"
        data = {
            'csrf_name': self.csrf_token,
            'master_cat': self.master_cat_id,
            'cat_val_text': self.cat_val_text
        }

        try:
            response = self.session.post(url, headers=self.headers, data=data, timeout=30)

            if response.status_code != 200:
                return None

            result = response.json()
            encrypted_data = result.get("response", "")

            if not encrypted_data:
                return None

            # Decrypt the data
            decrypted_data = self.decrypt_stream_optimized(encrypted_data)
            self.cached_data = decrypted_data
            return decrypted_data

        except Exception as e:
            print(f"❌ API Error: {e}")
            return None

    def get_master_cat(self):
        """Return only master_cat array from data"""
        if not self.cached_data:
            data = self.fetch_data()
            if not data:
                return {"status": False, "message": "Failed to fetch data"}

        if "data" in self.cached_data and "master_cat" in self.cached_data["data"]:
            return {
                "status": True,
                "data": self.cached_data["data"]["master_cat"]
            }
        return {"status": False, "message": "No master categories found"}

    def get_cat_type(self, master_id):
        """Return all_cat items with matching master_type and parent_id=0 and NO filters array"""
        if not self.cached_data:
            data = self.fetch_data()
            if not data:
                return {"status": False, "message": "Failed to fetch data"}

        if "data" in self.cached_data and "all_cat" in self.cached_data["data"]:
            all_cats = self.cached_data["data"]["all_cat"]

            # Filter conditions:
            # 1. master_type matches master_id
            # 2. parent_id is "0"
            # 3. NO filters key OR filters is empty array
            filtered_cats = []
            for cat in all_cats:
                cat_master_type = str(cat.get("master_type", ""))
                cat_parent_id = str(cat.get("parent_id", ""))

                # Check if filters key exists and is not empty array
                has_filters = "filters" in cat
                filters_empty = has_filters and isinstance(cat.get("filters"), list) and len(cat.get("filters", [])) == 0

                # Condition: should NOT have filters or filters should be empty
                no_filters = not has_filters or filters_empty

                if (cat_master_type == str(master_id) and
                    cat_parent_id == "0" and
                    no_filters):
                    filtered_cats.append(cat)

            return {
                "status": True,
                "data": filtered_cats
            }
        return {"status": False, "message": "No categories found"}

    def get_cat(self, master_id, type_id):
        """Return all_cat items with matching master_type, parent_id=type_id and HAS filters key (even if empty)"""
        if not self.cached_data:
            data = self.fetch_data()
            if not data:
                return {"status": False, "message": "Failed to fetch data"}

        if "data" in self.cached_data and "all_cat" in self.cached_data["data"]:
            all_cats = self.cached_data["data"]["all_cat"]

            # Filter conditions:
            # 1. master_type matches master_id
            # 2. parent_id matches type_id
            # 3. HAS filters key (value can be empty array or any array)
            filtered_cats = []
            for cat in all_cats:
                cat_master_type = str(cat.get("master_type", ""))
                cat_parent_id = str(cat.get("parent_id", ""))

                # Condition: MUST have filters key
                has_filters_key = "filters" in cat

                if (cat_master_type == str(master_id) and
                    cat_parent_id == str(type_id) and
                    has_filters_key):
                    filtered_cats.append(cat)

            return {
                "status": True,
                "data": filtered_cats
            }
        return {"status": False, "message": "No categories found"}

    def get_courses(self, type_id, sub_type_id, text, page=1):
        """Get courses for specific category and sub-category"""
        if not self.csrf_token and not self.get_csrf_token():
            return {"status": False, "message": "Failed to get CSRF token"}

        url = f"{self.base_url}/web/Home/getCourses"

        data = {
            'csrf_name': self.csrf_token,
            'cat': str(type_id),
            'sub_cat': str(sub_type_id),
            'catBranch_text': str(text),
            'course_type': '0',
            'page': str(page),
            'search': ''
        }

        try:
            response = self.session.post(url, headers=self.headers, data=data, timeout=30)

            if response.status_code != 200:
                return {"status": False, "message": f"API returned status code: {response.status_code}"}

            result = response.json()

            # Check if response contains encrypted data
            if "response" in result and result["response"]:
                encrypted_data = result.get("response", "")
                # Decrypt the data
                decrypted_data = self.decrypt_stream_optimized(encrypted_data)

                if decrypted_data:
                    return {
                        "status": True,
                        "data": decrypted_data
                    }
                else:
                    return {"status": False, "message": "Failed to decrypt course data"}
            else:
                # If no encrypted data, return the raw response
                return {
                    "status": True,
                    "data": result
                }

        except Exception as e:
            print(f"❌ Courses API Error: {e}")
            return {"status": False, "message": str(e)}

    def get_tiles_data(self, course_id, revert_api="1#0#0#1", parent_id=0, tile_id="15330", layer=1, type_value="course_combo"):
        """Get tiles data for a specific course"""
        if not self.csrf_token and not self.get_csrf_token():
            return {"status": False, "message": "Failed to get CSRF token"}

        # Create the tile_input JSON
        tile_input_json = {
            "course_id": str(course_id),
            "revert_api": revert_api,
            "parent_id": parent_id,
            "tile_id": str(tile_id),
            "layer": layer,
            "type": type_value
        }

        # Convert to JSON string
        tile_input_str = json.dumps(tile_input_json)

        # Encrypt the tile_input
        encrypted_tile_input = self.encrypt_data(tile_input_str)

        if not encrypted_tile_input:
            return {"status": False, "message": "Failed to encrypt tile data"}

        url = f"{self.base_url}/web/Course/tiles_data"

        data = {
            'tile_input': encrypted_tile_input,
            'csrf_name': self.csrf_token
        }

        try:
            response = self.session.post(url, headers=self.headers, data=data, timeout=30)

            if response.status_code != 200:
                return {"status": False, "message": f"API returned status code: {response.status_code}"}

            result = response.json()

            # Check if response contains encrypted data
            if "response" in result and result["response"]:
                encrypted_data = result.get("response", "")
                # Decrypt the data
                decrypted_data = self.decrypt_stream_optimized(encrypted_data)

                if decrypted_data:
                    return {
                        "status": True,
                        "tile_input": tile_input_json,
                        "encrypted_tile_input": encrypted_tile_input,
                        "data": decrypted_data
                    }
                else:
                    return {"status": False, "message": "Failed to decrypt tiles data"}
            else:
                # If no encrypted data, return the raw response
                return {
                    "status": True,
                    "tile_input": tile_input_json,
                    "encrypted_tile_input": encrypted_tile_input,
                    "data": result
                }

        except Exception as e:
            print(f"❌ Tiles API Error: {e}")
            return {"status": False, "message": str(e)}

    def get_combo_tiles(self, combo_course_id, revert_api="1#1#0#1", parent_id=None, tile_id="0", layer=1, page=1, type_value="content"):
        """Get combo tiles data for a combo course"""
        if not self.csrf_token and not self.get_csrf_token():
            return {"status": False, "message": "Failed to get CSRF token"}

        # If parent_id is not provided, use combo_course_id as parent_id
        if parent_id is None:
            parent_id = combo_course_id

        # Create the tile_input JSON with combo-specific structure
        tile_input_json = {
            "course_id": str(combo_course_id),
            "layer": layer,
            "page": page,
            "parent_id": str(parent_id),
            "revert_api": revert_api,
            "tile_id": str(tile_id),
            "type": type_value
        }

        # Convert to JSON string
        tile_input_str = json.dumps(tile_input_json)

        # Encrypt the tile_input
        encrypted_tile_input = self.encrypt_data(tile_input_str)

        if not encrypted_tile_input:
            return {"status": False, "message": "Failed to encrypt tile data"}

        url = f"{self.base_url}/web/Course/tiles_data"

        data = {
            'tile_input': encrypted_tile_input,
            'csrf_name': self.csrf_token
        }

        try:
            response = self.session.post(url, headers=self.headers, data=data, timeout=30)

            if response.status_code != 200:
                return {"status": False, "message": f"API returned status code: {response.status_code}"}

            result = response.json()

            # Check if response contains encrypted data
            if "response" in result and result["response"]:
                encrypted_data = result.get("response", "")
                # Decrypt the data
                decrypted_data = self.decrypt_stream_optimized(encrypted_data)

                if decrypted_data:
                    return {
                        "status": True,
                        "tile_input": tile_input_json,
                        "encrypted_tile_input": encrypted_tile_input,
                        "data": decrypted_data
                    }
                else:
                    return {"status": False, "message": "Failed to decrypt combo tiles data"}
            else:
                # If no encrypted data, return the raw response
                return {
                    "status": True,
                    "tile_input": tile_input_json,
                    "encrypted_tile_input": encrypted_tile_input,
                    "data": result
                }

        except Exception as e:
            print(f"❌ Combo Tiles API Error: {e}")
            return {"status": False, "message": str(e)}

    def get_layer_two_data(self, combo_course_id, subject_id, revert_api="1#0#0#1", parent_id=None, tile_id=0, layer=2, page=1, type_value="content"):
        """Get layer two data for a combo course (where subject_id = topic_id)"""
        if not self.csrf_token and not self.get_csrf_token():
            return {"status": False, "message": "Failed to get CSRF token"}

        # If parent_id is not provided, use combo_course_id as parent_id
        if parent_id is None:
            parent_id = combo_course_id

        # Create the layer_two_input_data JSON with subject_id = topic_id
        layer_two_input_json = {
            "course_id": str(combo_course_id),
            "parent_id": str(parent_id),
            "layer": layer,
            "page": page,
            "revert_api": revert_api,
            "subject_id": str(subject_id),
            "tile_id": tile_id,
            "topic_id": str(subject_id),  # Same as subject_id
            "type": type_value
        }

        # Convert to JSON string
        layer_two_input_str = json.dumps(layer_two_input_json)

        # Base64 encode the JSON string (not encrypt)
        base64_encoded_input = base64.b64encode(layer_two_input_str.encode('utf-8')).decode('utf-8')

        url = f"{self.base_url}/web/Course/get_layer_two_data"

        data = {
            'layer_two_input_data': base64_encoded_input,
            'csrf_name': self.csrf_token
        }

        try:
            response = self.session.post(url, headers=self.headers, data=data, timeout=30)

            if response.status_code != 200:
                return {"status": False, "message": f"API returned status code: {response.status_code}"}

            result = response.json()

            # Check if response contains encrypted data
            if "response" in result and result["response"]:
                encrypted_data = result.get("response", "")
                # Decrypt the data using both methods
                decrypted_data = self.decrypt_stream_optimized(encrypted_data) or self.decrypt_stream(encrypted_data)

                if decrypted_data:
                    return {
                        "status": True,
                        "layer_two_input": layer_two_input_json,
                        "base64_encoded_input": base64_encoded_input,
                        "data": decrypted_data
                    }
                else:
                    return {"status": False, "message": "Failed to decrypt layer two data"}
            else:
                # If no encrypted data, return the raw response
                return {
                    "status": True,
                    "layer_two_input": layer_two_input_json,
                    "base64_encoded_input": base64_encoded_input,
                    "data": result
                }

        except Exception as e:
            print(f"❌ Layer Two API Error: {e}")
            return {"status": False, "message": str(e)}

    def get_layer_two_with_topic(self, combo_course_id, subject_id, topic_id, revert_api="1#0#0#1", parent_id=None, tile_id=0, layer=2, page=1, type_value="content"):
        """Get layer two data with different subject_id and topic_id for a combo course"""
        if not self.csrf_token and not self.get_csrf_token():
            return {"status": False, "message": "Failed to get CSRF token"}

        # If parent_id is not provided, use combo_course_id as parent_id
        if parent_id is None:
            parent_id = combo_course_id

        # Create the layer_two_input_data JSON with different subject_id and topic_id
        layer_two_input_json = {
            "course_id": str(combo_course_id),
            "parent_id": str(parent_id),
            "layer": layer,
            "page": page,
            "revert_api": revert_api,
            "subject_id": str(subject_id),
            "tile_id": tile_id,
            "topic_id": str(topic_id),  # Different from subject_id
            "type": type_value
        }

        # Convert to JSON string
        layer_two_input_str = json.dumps(layer_two_input_json)

        # Base64 encode the JSON string (not encrypt)
        base64_encoded_input = base64.b64encode(layer_two_input_str.encode('utf-8')).decode('utf-8')

        url = f"{self.base_url}/web/Course/get_layer_two_data"

        data = {
            'layer_two_input_data': base64_encoded_input,
            'csrf_name': self.csrf_token
        }

        try:
            response = self.session.post(url, headers=self.headers, data=data, timeout=30)

            if response.status_code != 200:
                return {"status": False, "message": f"API returned status code: {response.status_code}"}

            result = response.json()

            # Check if response contains encrypted data
            if "response" in result and result["response"]:
                encrypted_data = result.get("response", "")
                # Decrypt the data using both methods
                decrypted_data = self.decrypt_stream_optimized(encrypted_data) or self.decrypt_stream(encrypted_data)

                if decrypted_data:
                    return {
                        "status": True,
                        "layer_two_input": layer_two_input_json,
                        "base64_encoded_input": base64_encoded_input,
                        "data": decrypted_data
                    }
                else:
                    return {"status": False, "message": "Failed to decrypt layer two data"}
            else:
                # If no encrypted data, return the raw response
                return {
                    "status": True,
                    "layer_two_input": layer_two_input_json,
                    "base64_encoded_input": base64_encoded_input,
                    "data": result
                }

        except Exception as e:
            print(f"❌ Layer Two with Topic API Error: {e}")
            return {"status": False, "message": str(e)}

    def get_layer_three_content(self, course_id, subject_id, topic_id, revert_api="1#0#0#1", parent_id=None, tile_id=0, layer=3, page=1, type_value="content"):
        """Get layer three content data (like tl.py proxy/content endpoint)"""
        if not self.csrf_token and not self.get_csrf_token():
            return {"status": False, "message": "Failed to get CSRF token"}

        # If parent_id is not provided, use course_id as parent_id
        if parent_id is None:
            parent_id = course_id

        # Create the layer_two_input_data JSON similar to tl.py
        content_data = {
            "course_id": int(course_id) if isinstance(course_id, (int, str)) and str(course_id).isdigit() else str(course_id),
            "parent_id": int(parent_id) if isinstance(parent_id, (int, str)) and str(parent_id).isdigit() else str(parent_id),
            "layer": layer,
            "page": page,
            "revert_api": revert_api,
            "subject_id": int(subject_id) if isinstance(subject_id, (int, str)) and str(subject_id).isdigit() else str(subject_id),
            "tile_id": tile_id,
            "topic_id": int(topic_id) if isinstance(topic_id, (int, str)) and str(topic_id).isdigit() else str(topic_id),
            "type": type_value
        }

        # Convert to JSON string
        content_data_str = json.dumps(content_data)

        # Base64 encode the JSON string
        base64_encoded_input = base64.b64encode(content_data_str.encode('utf-8')).decode('utf-8')

        url = f"{self.base_url}/web/Course/get_layer_two_data"

        data = {
            'layer_two_input_data': base64_encoded_input,
            'csrf_name': self.csrf_token
        }

        try:
            response = self.session.post(url, headers=self.headers, data=data, timeout=30)

            if response.status_code != 200:
                return {
                    "status": False,
                    "error": "Upstream API failed",
                    "status_code": response.status_code,
                    "text": response.text[:200] if response.text else ""
                }

            result = response.json()

            # Check if response contains encrypted data
            if "response" in result and result["response"]:
                encrypted_data = result.get("response", "")
                # Use the tl.py style decryption
                decrypted_data = self.decrypt_stream(encrypted_data)

                if decrypted_data:
                    return {
                        "status": True,
                        "content_input": content_data,
                        "base64_encoded_input": base64_encoded_input,
                        "data": decrypted_data
                    }
                else:
                    # Try the other decryption method as fallback
                    decrypted_data_fallback = self.decrypt_stream_optimized(encrypted_data)
                    if decrypted_data_fallback:
                        return {
                            "status": True,
                            "content_input": content_data,
                            "base64_encoded_input": base64_encoded_input,
                            "data": decrypted_data_fallback
                        }
                    else:
                        return {"status": False, "message": "Failed to decrypt content data"}
            else:
                # If no encrypted data, return the raw response
                return {
                    "status": True,
                    "content_input": content_data,
                    "base64_encoded_input": base64_encoded_input,
                    "data": result
                }

        except Exception as e:
            print(f"❌ Layer Three Content API Error: {e}")
            return {"status": False, "message": str(e)}

    def get_video_meta(self, user_id, item_id, course_id, tile_id, download_click="0", device_id=None, device_name=None, jwt=None):
        """Get video metadata (like tl.py proxy/meta endpoint)"""
        try:
            # Convert parameters to appropriate types
            item_id_int = int(item_id)
            course_id_int = int(course_id)
            tile_id_int = int(tile_id)
        except ValueError:
            return {"status": False, "message": "Invalid parameters: item_id, course_id, and tile_id must be integers"}

        # Generate key and IV from user_id
        key, iv = self.generate_key_iv(user_id)

        # Set default values for optional parameters
        if device_id is None:
            device_id = "server_does_not_validate_it"
        if device_name is None:
            device_name = "server_does_not_validate_it"
        if jwt is None:
            jwt = self.default_jwt

        # Create meta data payload
        meta_data = {
            "course_id": course_id_int,
            "device_id": device_id,
            "device_name": device_name,
            "download_click": download_click,
            "name": f"{item_id_int}_0_0",
            "tile_id": tile_id_int,
            "type": "video"
        }

        # Encrypt the payload
        try:
            encrypted = self.encrypt_payload(meta_data, key, iv)
        except Exception as e:
            return {"status": False, "message": f"Encryption failed: {str(e)}"}

        # Prepare headers
        headers = {
            "Authorization": self.auth_header,
            "Content-Type": "text/plain; charset=UTF-8",
            "devicetype": "1",
            "host": "application.utkarshapp.com",
            "lang": "1",
            "user-agent": "okhttp/4.9.0",
            "userid": user_id,
            "version": "152",
            "jwt": jwt
        }

        # Make request to meta API
        url = f"{self.meta_api_base}{self.meta_path}"

        try:
            response = requests.post(url, headers=headers, data=encrypted, timeout=30)

            if response.status_code != 200:
                return {
                    "status": False,
                    "message": f"Upstream API failed with status {response.status_code}",
                    "status_code": response.status_code,
                    "text": response.text[:200] if response.text else ""
                }

            # Decrypt the response
            try:
                decrypted = self.decrypt_payload(response.text, key, iv)
                return {
                    "status": True,
                    "meta_input": meta_data,
                    "encrypted_input": encrypted,
                    "data": decrypted
                }
            except Exception as e:
                return {
                    "status": False,
                    "message": f"Decryption failed: {str(e)}",
                    "raw_response": response.text[:500] if response.text else ""
                }

        except Exception as e:
            print(f"❌ Video Meta API Error: {e}")
            return {"status": False, "message": str(e)}

# Create global API instance
api = UtkarshAPI()

@app.route('/master_cat', methods=['GET'])
def master_cat():
    """Endpoint 1: Get master categories"""
    result = api.get_master_cat()
    return jsonify(result)

@app.route('/cat_type', methods=['GET'])
def cat_type():
    """Endpoint 2: Get categories by master_id"""
    master_id = request.args.get('master_id')
    if not master_id:
        return jsonify({"status": False, "message": "master_id parameter is required"}), 400

    result = api.get_cat_type(master_id)
    return jsonify(result)

@app.route('/get_cat', methods=['GET'])
def get_cat():
    """Endpoint 3: Get categories by master_id and type_id"""
    master_id = request.args.get('master_id')
    type_id = request.args.get('type_id')

    if not master_id:
        return jsonify({"status": False, "message": "master_id parameter is required"}), 400
    if not type_id:
        return jsonify({"status": False, "message": "type_id parameter is required"}), 400

    result = api.get_cat(master_id, type_id)
    return jsonify(result)

@app.route('/get_courses', methods=['GET'])
def get_courses():
    """Endpoint 4: Get courses by category and sub-category"""
    type_id = request.args.get('type_id')
    sub_type_id = request.args.get('sub_type_id')
    text = request.args.get('text', '')
    page = request.args.get('page', '1')

    if not type_id:
        return jsonify({"status": False, "message": "type_id parameter is required"}), 400
    if not sub_type_id:
        return jsonify({"status": False, "message": "sub_type_id parameter is required"}), 400

    # Convert page to integer, default to 1
    try:
        page_int = int(page)
    except ValueError:
        page_int = 1

    result = api.get_courses(type_id, sub_type_id, text, page_int)
    return jsonify(result)

@app.route('/get_tiles', methods=['GET'])
def get_tiles():
    """Endpoint 5: Get tiles data for a course"""
    course_id = request.args.get('course_id')

    if not course_id:
        return jsonify({"status": False, "message": "course_id parameter is required"}), 400

    # Optional parameters
    revert_api = request.args.get('revert_api', '1#0#0#1')
    parent_id = request.args.get('parent_id', '0')
    tile_id = request.args.get('tile_id', '15330')
    layer = request.args.get('layer', '1')
    type_value = request.args.get('type', 'course_combo')

    # Convert parent_id and layer to integers
    try:
        parent_id_int = int(parent_id)
    except ValueError:
        parent_id_int = 0

    try:
        layer_int = int(layer)
    except ValueError:
        layer_int = 1

    result = api.get_tiles_data(
        course_id=course_id,
        revert_api=revert_api,
        parent_id=parent_id_int,
        tile_id=tile_id,
        layer=layer_int,
        type_value=type_value
    )
    return jsonify(result)

@app.route('/get_combo_tiles', methods=['GET'])
def get_combo_tiles():
    """Endpoint 6: Get combo tiles data for a combo course"""
    combo_course_id = request.args.get('combo_course_id')

    if not combo_course_id:
        return jsonify({"status": False, "message": "combo_course_id parameter is required"}), 400

    # Optional parameters
    revert_api = request.args.get('revert_api', '1#1#0#1')
    parent_id = request.args.get('parent_id', None)  # Defaults to combo_course_id if not provided
    tile_id = request.args.get('tile_id', '0')
    layer = request.args.get('layer', '1')
    page = request.args.get('page', '1')
    type_value = request.args.get('type', 'content')

    # Convert parameters to appropriate types
    try:
        layer_int = int(layer)
    except ValueError:
        layer_int = 1

    try:
        page_int = int(page)
    except ValueError:
        page_int = 1

    # Convert parent_id to string if provided, otherwise keep as None
    parent_id_str = str(parent_id) if parent_id else None

    result = api.get_combo_tiles(
        combo_course_id=combo_course_id,
        revert_api=revert_api,
        parent_id=parent_id_str,
        tile_id=tile_id,
        layer=layer_int,
        page=page_int,
        type_value=type_value
    )
    return jsonify(result)

@app.route('/get_layer_two', methods=['GET'])
def get_layer_two():
    """Endpoint 7: Get layer two data for a combo course (subject_id = topic_id)"""
    combo_course_id = request.args.get('combo_course_id')
    subject_id = request.args.get('subject_id')

    if not combo_course_id:
        return jsonify({"status": False, "message": "combo_course_id parameter is required"}), 400
    if not subject_id:
        return jsonify({"status": False, "message": "subject_id parameter is required"}), 400

    # Optional parameters
    revert_api = request.args.get('revert_api', '1#0#0#1')
    parent_id = request.args.get('parent_id', None)  # Defaults to combo_course_id if not provided
    tile_id = request.args.get('tile_id', '0')
    layer = request.args.get('layer', '2')
    page = request.args.get('page', '1')
    type_value = request.args.get('type', 'content')

    # Convert parameters to appropriate types
    try:
        layer_int = int(layer)
    except ValueError:
        layer_int = 2

    try:
        page_int = int(page)
    except ValueError:
        page_int = 1

    try:
        tile_id_int = int(tile_id)
    except ValueError:
        tile_id_int = 0

    # Convert parent_id to string if provided, otherwise keep as None
    parent_id_str = str(parent_id) if parent_id else None

    result = api.get_layer_two_data(
        combo_course_id=combo_course_id,
        subject_id=subject_id,
        revert_api=revert_api,
        parent_id=parent_id_str,
        tile_id=tile_id_int,
        layer=layer_int,
        page=page_int,
        type_value=type_value
    )
    return jsonify(result)

@app.route('/get_layer_two_with_topic', methods=['GET'])
def get_layer_two_with_topic():
    """Endpoint 8: Get layer two data with different subject_id and topic_id for a combo course"""
    combo_course_id = request.args.get('combo_course_id')
    subject_id = request.args.get('subject_id')
    topic_id = request.args.get('topic_id')

    if not combo_course_id:
        return jsonify({"status": False, "message": "combo_course_id parameter is required"}), 400
    if not subject_id:
        return jsonify({"status": False, "message": "subject_id parameter is required"}), 400
    if not topic_id:
        return jsonify({"status": False, "message": "topic_id parameter is required"}), 400

    # Optional parameters
    revert_api = request.args.get('revert_api', '1#0#0#1')
    parent_id = request.args.get('parent_id', None)  # Defaults to combo_course_id if not provided
    tile_id = request.args.get('tile_id', '0')
    layer = request.args.get('layer', '2')
    page = request.args.get('page', '1')
    type_value = request.args.get('type', 'content')

    # Convert parameters to appropriate types
    try:
        layer_int = int(layer)
    except ValueError:
        layer_int = 2

    try:
        page_int = int(page)
    except ValueError:
        page_int = 1

    try:
        tile_id_int = int(tile_id)
    except ValueError:
        tile_id_int = 0

    # Convert parent_id to string if provided, otherwise keep as None
    parent_id_str = str(parent_id) if parent_id else None

    result = api.get_layer_two_with_topic(
        combo_course_id=combo_course_id,
        subject_id=subject_id,
        topic_id=topic_id,
        revert_api=revert_api,
        parent_id=parent_id_str,
        tile_id=tile_id_int,
        layer=layer_int,
        page=page_int,
        type_value=type_value
    )
    return jsonify(result)

@app.route('/get_layer_three_content', methods=['GET'])
def get_layer_three_content():
    """Endpoint 9: Get layer three content data (similar to tl.py proxy/content endpoint)"""
    course_id = request.args.get('course_id')
    subject_id = request.args.get('subject_id')
    topic_id = request.args.get('topic_id')

    if not course_id:
        return jsonify({"status": False, "message": "course_id parameter is required"}), 400
    if not subject_id:
        return jsonify({"status": False, "message": "subject_id parameter is required"}), 400
    if not topic_id:
        return jsonify({"status": False, "message": "topic_id parameter is required"}), 400

    # Optional parameters
    revert_api = request.args.get('revert_api', '1#0#0#1')
    parent_id = request.args.get('parent_id', None)  # Defaults to course_id if not provided
    tile_id = request.args.get('tile_id', '0')
    layer = request.args.get('layer', '3')
    page = request.args.get('page', '1')
    type_value = request.args.get('type', 'content')

    # Convert parameters to appropriate types
    try:
        layer_int = int(layer)
    except ValueError:
        layer_int = 3

    try:
        page_int = int(page)
    except ValueError:
        page_int = 1

    try:
        tile_id_int = int(tile_id)
    except ValueError:
        tile_id_int = 0

    # Convert parent_id if provided
    parent_id_str = str(parent_id) if parent_id else None

    result = api.get_layer_three_content(
        course_id=course_id,
        subject_id=subject_id,
        topic_id=topic_id,
        revert_api=revert_api,
        parent_id=parent_id_str,
        tile_id=tile_id_int,
        layer=layer_int,
        page=page_int,
        type_value=type_value
    )
    return jsonify(result)

@app.route('/get_video_meta', methods=['GET'])
def get_video_meta():
    """Endpoint 10: Get video metadata (similar to tl.py proxy/meta endpoint)"""
    user_id = request.args.get('userid')
    item_id = request.args.get('item_id')
    course_id = request.args.get('course_id')
    tile_id = request.args.get('tile_id')

    if not user_id:
        return jsonify({"status": False, "message": "userid parameter is required"}), 400
    if not item_id:
        return jsonify({"status": False, "message": "item_id parameter is required"}), 400
    if not course_id:
        return jsonify({"status": False, "message": "course_id parameter is required"}), 400
    if not tile_id:
        return jsonify({"status": False, "message": "tile_id parameter is required"}), 400

    # Optional parameters
    download_click = request.args.get('download_click', '0')
    device_id = request.args.get('device_id', None)
    device_name = request.args.get('device_name', None)
    jwt = request.args.get('jwt', None)

    result = api.get_video_meta(
        user_id=user_id,
        item_id=item_id,
        course_id=course_id,
        tile_id=tile_id,
        download_click=download_click,
        device_id=device_id,
        device_name=device_name,
        jwt=jwt
    )
    return jsonify(result)

@app.route('/refresh', methods=['GET'])
def refresh():
    """Refresh cached data"""
    result = api.fetch_data()
    if result:
        return jsonify({"status": True, "message": "Data refreshed successfully"})
    return jsonify({"status": False, "message": "Failed to refresh data"}), 500

@app.route('/status', methods=['GET'])
def status():
    """API status"""
    return jsonify({
        "status": True,
        "master_cat_id": api.master_cat_id,
        "cat_val_text": api.cat_val_text,
        "cached": api.cached_data is not None
    })

if __name__ == '__main__':
    print("🚀 Utkarsh API Server Starting...")
    print("=" * 50)
    print("Available Endpoints:")
    print("1. GET /master_cat - Get master categories")
    print("2. GET /cat_type?master_id=<id> - Get parent categories (parent_id=0, no filters)")
    print("3. GET /get_cat?master_id=<id>&type_id=<id> - Get child categories (has filters key)")
    print("4. GET /get_courses?type_id=<id>&sub_type_id=<id>&text=<text>&page=<page> - Get courses")
    print("5. GET /get_tiles?course_id=<id>&[optional params] - Get tiles data for a course")
    print("6. GET /get_combo_tiles?combo_course_id=<id>&[optional params] - Get combo tiles data")
    print("7. GET /get_layer_two?combo_course_id=<id>&subject_id=<id>&[optional params] - Get layer two data (subject_id = topic_id)")
    print("8. GET /get_layer_two_with_topic?combo_course_id=<id>&subject_id=<id>&topic_id=<id>&[optional params] - Get layer two data (subject_id ≠ topic_id)")
    print("9. GET /get_layer_three_content?course_id=<id>&subject_id=<id>&topic_id=<id>&[optional params] - Get layer three content data")
    print("10. GET /get_video_meta?userid=<id>&item_id=<id>&course_id=<id>&tile_id=<id>&[optional params] - Get video metadata")
    print("11. GET /refresh - Refresh cached data")
    print("12. GET /status - API status")
    print("=" * 50)

    # Fetch initial data
    print("📡 Fetching initial data...")
    api.fetch_data()
    print("✅ API Ready!")

    app.run(debug=True, host='0.0.0.0', port=5000)